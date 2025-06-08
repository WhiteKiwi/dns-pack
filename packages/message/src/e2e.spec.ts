import * as crypto from 'crypto';
import { describe, it } from 'vitest';
import { Name } from './common/name';
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
    const zsk = findAndParseZSK(dnskeyResponse.answers);
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

    const rrsigData = findAndParseRRSIG(aResponse.answers);
    console.log('RRSIG: ', rrsigData, '\n');

    const aRRSet = aResponse.answers
      .filter((answer) => answer.type.valueOf() === ResourceRecord.Type.A.valueOf())
      .map((answer) => {
        return ResourceRecord.A.of({
          name: answer.name.valueOf(),
          class: ResourceRecord.Class.Readable(answer.class.valueOf()),
          ttl: rrsigData.originalTTL,
          ipv4: Array.from(answer.data.serialize())
            .map((byte) => byte.toString(10))
            .join('.'),
        });
      });
    const canonicalizedRRSet = aRRSet.sort((a, b) => a.ipv4.localeCompare(b.ipv4));
    console.log(
      'canonicalizedRRSet: \n',
      canonicalizedRRSet
        .map(
          (rr) =>
            `  ${rr.name.valueOf()}\t${rr.ttl}\t${ResourceRecord.Class.Readable(
              rr.class.valueOf(),
            )}\t${ResourceRecord.Type.Readable(rr.type.valueOf())}\t${rr.ipv4}`,
        )
        .join('\n'),
      '\n',
    );
    const canonicalized = Buffer.concat(canonicalizedRRSet.map((rr) => rr.serialize()));

    const result = verifyRRSIG_ECDSA(
      canonicalized,
      zsk.publicKey,
      rrsigData.prefix,
      rrsigData.signature,
    );
    console.log('result:', result);
  });
});

const queryA = DnsMessage.Query(
  Math.floor(Math.random() * 65535), // ID
  Header.Flags.of({
    QR: 'query',
    OPCODE: Header.Flags.Opcode.QUERY,
    AA: false,
    TC: false,
    RD: false,
    RA: false,
    Z: false,
    AD: false,
    CD: false,
    RCODE: 0,
  }),
  {
    questions: [Question.of({ name: 'example.com.', type: 'A', class: 'IN' })],
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
  Header.Flags.of({
    QR: 'query',
    OPCODE: Header.Flags.Opcode.QUERY,
    AA: false,
    TC: false,
    RD: false,
    RA: false,
    Z: false,
    AD: false,
    CD: false,
    RCODE: 0,
  }),
  {
    questions: [Question.of({ name: 'example.com.', type: 'DNSKEY', class: 'IN' })],
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
  const queryBase64 = query.serialize().toString('base64').replace(/=*$/, '');
  const response = await fetch(`https://${host}/dns-query?dns=${queryBase64}`, {
    headers: { accept: 'application/dns-message' },
  });
  const data = await response.arrayBuffer();
  return DnsMessage.parse(Buffer.from(data));
}

function findAndParseZSK(answers: ResourceRecord[]) {
  const zsk = answers
    .filter((answer) => answer.type.valueOf() === ResourceRecord.Type.DNSKEY.valueOf())
    .map((answer) => {
      const serialized = answer.data.serialize();
      const flags = serialized.readUInt16BE(0);
      const protocol = serialized.readUInt8(2);
      const algorithm = serialized.readUInt8(4);
      const publicKey = serialized.subarray(4);
      return { flags, protocol, algorithm, publicKey };
    })
    .find((answer) => answer.flags === 256);
  if (!zsk) {
    throw new Error('ZSK not found');
  }
  return zsk;
}

function findAndParseRRSIG(answers: ResourceRecord[]) {
  const rrsigRR = answers.find(
    (answer) => answer.type.valueOf() === ResourceRecord.Type.RRSIG.valueOf(),
  );
  if (!rrsigRR) {
    throw new Error('RRSIG not found');
  }
  const serialized = rrsigRR.data.serialize();
  const { name, offset } = Name.parse(serialized, 18);
  const rrsig = {
    typeCovered: serialized.readUInt16BE(0),
    algorithm: serialized.readUInt8(2),
    labels: serialized.readUInt8(3),
    originalTTL: serialized.readUInt32BE(4),
    expiration: serialized.readUInt32BE(8),
    inception: serialized.readUInt32BE(12),
    keyTag: serialized.readUInt16BE(16),
    signerName: name.valueOf(),
    signature: serialized.subarray(offset),
    prefix: serialized.subarray(0, offset),
  };
  return rrsig;
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
