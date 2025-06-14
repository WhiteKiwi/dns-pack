import * as crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import { Name, nameParser } from './common/name';
import { TypedBinaryParser } from './common/typed-binary-parser';
import { UrlSafeBase64 } from './common/url-safe-base64';
import { dnsMessageToReadable } from './common/utils/dns-message-to-readable';
import { Header } from './message/header/header';
import { DnsMessage } from './message/message';
import { Question } from './message/question/question';
import { ResourceRecord } from './message/resource-record/resource-record';

describe.skipIf(process.env.CI)('e2e', () => {
  it('test', async () => {
    const dnskeyResponse = await queryDnsOverHttps('dns.google', queryDNSKEY);
    console.log('============================== request ==============================');
    console.log('response(DNSKEY): ', dnsMessageToReadable(dnskeyResponse), '\n');

    const aResponse = await queryDnsOverHttps('dns.google', queryA);
    console.log('response(A): ', dnsMessageToReadable(aResponse), '\n');

    console.log('============================== verify ==============================');
    const zskList = findAndParseZSKList(dnskeyResponse.answers);
    for (const zsk of zskList) {
      console.log(
        'ZSK: ',
        {
          flags: zsk.flags,
          protocol: zsk.protocol,
          algorithm: zsk.algorithm,
          publicKey: zsk.publicKey.toString('base64'),
        },
        '\n',
      );
    }

    const rrsigData = findAndParseRRSIG(aResponse.answers);
    console.log('RRSIG: ', rrsigData, '\n');

    const zsk = zskList.find((zsk) => zsk.keyTag === rrsigData.keyTag);
    if (!zsk) {
      throw new Error('ZSK not found');
    }

    const aRRSet = aResponse.answers
      .filter((answer) => answer.type.valueOf() === ResourceRecord.Type.A.valueOf())
      .map((answer) =>
        ResourceRecord.A.from({
          name: answer.name,
          type: answer.type,
          class: answer.class,
          ttl: rrsigData.originalTTL,
          data: answer.data,
        }),
      );
    const canonicalizedRRSet = aRRSet.sort((a, b) =>
      a.data.valueOf().localeCompare(b.data.valueOf()),
    );
    console.log(
      'canonicalizedRRSet: \n' +
        canonicalizedRRSet
          .map(
            (rr) =>
              `  ${rr.name.valueOf()}\t${
                rr.ttl
              }\t${rr.class.toJSON()}\t${rr.type.toJSON()}\t${rr.data.valueOf()}`,
          )
          .join('\n'),
      '\n',
    );
    const canonicalized = Buffer.concat(canonicalizedRRSet.map((rr) => rr.serialize()));
    if (rrsigData.algorithm !== 13) {
      throw new Error(`Unsupported algorithm: ${rrsigData.algorithm}`);
    }
    const result = verifyRRSIG_ECDSA(
      canonicalized,
      zsk.publicKey,
      rrsigData.prefix,
      rrsigData.signature,
    );
    expect(result).toBe(true);
  });
});

const queryA = DnsMessage.Query(
  Math.floor(Math.random() * 65535), // ID
  Header.Flags.from({
    QR: 'query',
    OPCODE: Header.Flags.Opcode.QUERY,
    AA: false,
    TC: false,
    RD: true,
    RA: false,
    Z: false,
    AD: false,
    CD: false,
    RCODE: 0,
  }),
  {
    questions: [
      Question.from({
        name: Name.of('example.com.'),
        type: ResourceRecord.Type.A,
        class: ResourceRecord.Class.IN,
      }),
    ],
    additional: [
      ResourceRecord.OPT.of({
        version: 0,
        flags: { DO: true },
        extendedRCode: 0,
        options: [],
        udpPayloadSize: 512,
      }),
    ],
  },
);

const queryDNSKEY = DnsMessage.Query(
  Math.floor(Math.random() * 65535), // ID
  Header.Flags.from({
    QR: 'query',
    OPCODE: Header.Flags.Opcode.QUERY,
    AA: false,
    TC: false,
    RD: true,
    RA: false,
    Z: false,
    AD: false,
    CD: false,
    RCODE: 0,
  }),
  {
    questions: [
      Question.from({
        name: Name.of('example.com.'),
        type: ResourceRecord.Type.DNSKEY,
        class: ResourceRecord.Class.IN,
      }),
    ],
    additional: [
      ResourceRecord.OPT.of({
        version: 0,
        flags: { DO: true },
        extendedRCode: 0,
        options: [],
        udpPayloadSize: 512,
      }),
    ],
  },
);

async function queryDnsOverHttps(host: string, query: DnsMessage): Promise<DnsMessage> {
  const response = await fetch(
    `https://${host}/dns-query?dns=${UrlSafeBase64.encode(query.serialize())}`,
    {
      headers: { accept: 'application/dns-message' },
    },
  );
  const data = await response.arrayBuffer();
  return DnsMessage.parse(Buffer.from(data));
}

const dnskeyParser = new TypedBinaryParser<{
  flags: number;
  protocol: number;
  algorithm: number;
  publicKey: Buffer;
}>()
  .endianess('big')
  .uint16('flags')
  .uint8('protocol')
  .uint8('algorithm')
  .buffer('publicKey', { length: 'publicKeyLength', readUntil: 'eof' });

function findAndParseZSKList(answers: ResourceRecord[]) {
  const zskList = answers
    .filter((answer) => answer.type.valueOf() === ResourceRecord.Type.DNSKEY.valueOf())
    .map((answer) => {
      const serialized = answer.data.serialize();
      return dnskeyParser.parse(serialized);
    })
    .filter((answer) => answer.flags === 256)
    .map((zsk) => ({
      ...zsk,
      keyTag: dnskeyToKeyTag(zsk),
    }));
  if (!zskList.length) {
    throw new Error('ZSK not found');
  }
  return zskList;
}

const rrsigParser = new TypedBinaryParser<{
  typeCovered: number;
  algorithm: number;
  labels: number;
  originalTTL: number;
  expiration: number;
  inception: number;
  keyTag: number;
  signerName: string;
  signature: Buffer;
  prefix: Buffer;
}>()
  .endianess('big')
  .uint16('typeCovered')
  .uint8('algorithm')
  .uint8('labels')
  .uint32('originalTTL')
  .uint32('expiration')
  .uint32('inception')
  .uint16('keyTag')
  .nest('signerName', {
    type: nameParser,
    formatter: Name.from,
  })
  .buffer('signature', { length: 'signatureLength', readUntil: 'eof' });

function findAndParseRRSIG(answers: ResourceRecord[]) {
  const rrsigRR = answers.find(
    (answer) => answer.type.valueOf() === ResourceRecord.Type.RRSIG.valueOf(),
  );
  if (!rrsigRR) {
    throw new Error('RRSIG not found');
  }
  const serialized = rrsigRR.data.serialize();
  const rrsig = rrsigParser.parse(serialized);

  return {
    ...rrsig,
    prefix: serialized.subarray(0, serialized.length - rrsig.signature.length),
  };
}

function verifyRRSIG_ECDSA(
  rrsetCanonical: Buffer,
  publicKey: Buffer,
  prefixRRSIG: Buffer,
  signature: Buffer,
): boolean {
  const ec = new (require('elliptic').ec)('p256'); // P-256 curve (same as secp256r1)

  const pubPoint = ec.keyFromPublic({
    x: publicKey.subarray(0, 32).toString('hex'),
    y: publicKey.subarray(32).toString('hex'),
  });

  const r = signature.subarray(0, 32);
  const s = signature.subarray(32);

  const sigObj = { r: r.toString('hex'), s: s.toString('hex') };

  const message = Buffer.concat([prefixRRSIG, rrsetCanonical]);
  const digest = crypto.createHash('sha256').update(message).digest();

  const verified = pubPoint.verify(digest, sigObj);
  return verified;
}

function dnskeyToKeyTag({
  flags,
  protocol,
  algorithm,
  publicKey,
}: {
  flags: number;
  protocol: number;
  algorithm: number;
  publicKey: Buffer;
}): number {
  // 1. Build DNSKEY RDATA
  // Flags (2 bytes, BE), Protocol (1 byte), Algorithm (1 byte), PublicKey (n bytes)
  const rdata = Buffer.alloc(4 + publicKey.length);
  rdata.writeUInt16BE(flags, 0);
  rdata.writeUInt8(protocol, 2);
  rdata.writeUInt8(algorithm, 3);
  publicKey.copy(rdata, 4);

  // 2. Key Tag Calculation (RFC 4034, Appendix B.1)
  let ac = 0;
  for (let i = 0; i < rdata.length; ++i) {
    ac += i & 1 ? rdata[i] : rdata[i] << 8;
  }
  ac += (ac >> 16) & 0xffff; // add overflow
  return ac & 0xffff;
}
