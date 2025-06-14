import { describe, expect, it } from 'vitest';
import { HexReadable } from '../../common/utils/hex-readable';
import { Header, headerParser } from './header';

describe('Header', () => {
  it('should serialize', () => {
    const header = Header.from({
      id: 1234,
      flags: Header.Flags.from({
        QR: 'query',
        OPCODE: Header.Flags.Opcode.QUERY.valueOf(),
        AA: false,
        TC: false,
        RD: false,
        RA: false,
        Z: false,
        AD: false,
        CD: false,
        RCODE: 0,
      }),
      count: {
        question: 1,
        answer: 0,
        authority: 0,
        additional: 0,
      },
    });
    expect(HexReadable.fromBuffer(header.serialize())).toMatchInlineSnapshot(
      `"04 d2 00 00  00 01 00 00    00 00 00 00"`,
    );
  });

  it('should parse', () => {
    const serialized = HexReadable.toBuffer(
      `04 d2 00 00  00 01 00 00
      00 00 00 00`,
    );
    const header = Header.from(headerParser.parse(serialized));
    expect(header.id).toBe(1234);
    expect(header.flags.QR).toBe('query');
    expect(header.flags.OPCODE).toBe(Header.Flags.Opcode.QUERY);
    expect(header.count.question).toBe(1);
  });
});
