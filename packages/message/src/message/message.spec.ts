import { describe, expect, it } from 'vitest';
import { dnsMessageToReadable } from '../common/utils/dns-message-to-readable';
import { HexReadable } from '../common/utils/hex-readable';
import { DnsMessage } from './message';
import { ResourceRecord } from './resource-record/resource-record';

describe('DnsMessage', () => {
  it('should serialize', () => {
    const message = DnsMessage.Query(
      1234, // ID
      {
        QR: 'query',
        OPCODE: 'QUERY',
        AA: false,
        TC: false,
        RD: false,
        RA: false,
        Z: false,
        AD: false,
        CD: false,
        RCODE: 0,
      },
      {
        questions: [{ name: 'example.com.', type: 'A', class: 'IN' }],
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

    expect(
      Array.from(message.serialize())
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' '),
    ).toMatchInlineSnapshot(
      `"04 d2 00 00 00 01 00 00 00 00 00 01 07 65 78 61 6d 70 6c 65 03 63 6f 6d 00 00 01 00 01 00 00 29 02 00 00 00 80 00 00 00"`,
    );

    expect(message.serialize().toString('base64')).toMatchInlineSnapshot(
      `"BNIAAAABAAAAAAABB2V4YW1wbGUDY29tAAABAAEAACkCAAAAgAAAAA=="`,
    );
  });

  it('should parse', () => {
    const serialized = HexReadable.toBuffer(`
      04 d2 80 a0 00 01 00 07    00 00 00 01 07 65 78 61 
      6d 70 6c 65 03 63 6f 6d    00 00 01 00 01 c0 0c 00
      01 00 01 00 00 00 d6 00    04 60 07 80 c6 c0 0c 00 
      01 00 01 00 00 00 d6 00    04 17 d7 00 88 c0 0c 00 
      01 00 01 00 00 00 d6 00    04 17 d7 00 8a c0 0c 00 
      01 00 01 00 00 00 d6 00    04 60 07 80 af c0 0c 00 
      01 00 01 00 00 00 d6 00    04 17 c0 e4 54 c0 0c 00 
      01 00 01 00 00 00 d6 00    04 17 c0 e4 50 c0 0c 00 
      2e 00 01 00 00 00 d6 00    5f 00 01 0d 02 00 00 01 
      2c 68 55 34 a8 68 38 f9    d7 c9 c3 07 65 78 61 6d 
      70 6c 65 03 63 6f 6d 00    8f c4 0d c0 91 7b 36 ec 
      2e bf eb ad 51 38 46 43    39 06 5c cc f8 1b a4 32 
      c3 ba 27 df f0 b8 47 6c    fa 1e 9f b5 ad 8d 29 5d 
      44 bd 30 4b 50 0e 15 4f    f0 b8 44 7c 04 e4 60 81 
      20 df 5c 2c 19 47 fa 8d    00 00 29 02 00 00 00 80 
      00 00 00
    `);

    const message = DnsMessage.parse(serialized);
    expect(dnsMessageToReadable(message)).toMatchInlineSnapshot(`
      ">> Header
        - ID: 1234
        - FLAGS:
          - QR: response
          - Opcode: QUERY
          - AA: false
          - TC: false
          - RD: false
          - RA: true
          - Z: false
          - AD: true
          - CD: false
          - RCODE: 0
        - QDCOUNT: 1
        - ANCOUNT: 7
        - NSCOUNT: 0
        - ARCOUNT: 1

      >> Questions
        - 1. Name: example.com., Type: A, Class: IN

      >> Answers
        > 1. Name: example.com.
          - Type: A
          - Class: IN
          - Ttl: 214
          - Data: 60 07 80 c6
        > 2. Name: example.com.
          - Type: A
          - Class: IN
          - Ttl: 214
          - Data: 17 d7 00 88
        > 3. Name: example.com.
          - Type: A
          - Class: IN
          - Ttl: 214
          - Data: 17 d7 00 8a
        > 4. Name: example.com.
          - Type: A
          - Class: IN
          - Ttl: 214
          - Data: 60 07 80 af
        > 5. Name: example.com.
          - Type: A
          - Class: IN
          - Ttl: 214
          - Data: 17 c0 e4 54
        > 6. Name: example.com.
          - Type: A
          - Class: IN
          - Ttl: 214
          - Data: 17 c0 e4 50
        > 7. Name: example.com.
          - Type: RRSIG
          - Class: IN
          - Ttl: 214
          - Data: 
            00 01 0d 02  00 00 01 2c    68 55 34 a8  68 38 f9 d7
            c9 c3 07 65  78 61 6d 70    6c 65 03 63  6f 6d 00 8f
            c4 0d c0 91  7b 36 ec 2e    bf eb ad 51  38 46 43 39
            06 5c cc f8  1b a4 32 c3    ba 27 df f0  b8 47 6c fa
            1e 9f b5 ad  8d 29 5d 44    bd 30 4b 50  0e 15 4f f0
            b8 44 7c 04  e4 60 81 20    df 5c 2c 19  47 fa 8d

      >> Authorities

      >> Additional
        > 1. Name: 
          - Type: OPT
          - Class: UdpPayloadSize(512)
          - Ttl: 32768
          - Data: (no data)"
    `);
  });
});
