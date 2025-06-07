import { describe, expect, it } from 'vitest';
import { DnsClass } from '../common/types/class';
import { DnsType } from '../common/types/type';
import { Header } from './header/header';
import { DnsMessage } from './message';
import { Question } from './question/question';
import { ResourceRecord } from './resource-record/resource-record';

describe('DnsMessage', () => {
  it('should serialize', () => {
    const message = DnsMessage.create(
      1234, // ID
      {
        QR: 'query',
        Opcode: Header.Flags.Opcode.QUERY,
        AA: false,
        TC: false,
        RD: false,
        RA: false,
        RCODE: 0,
      },
      // question
      [new Question('example.com.', DnsType.A, DnsClass.IN)],
      // answer
      [],
      // authority
      [],
      // additional
      [
        new ResourceRecord.OPT(
          0, // version
          [], // options
          0, // extended rcode
          { DO: true }, // flags
          512, // requestor's udp payload size
        ),
      ],
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
});
