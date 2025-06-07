import { describe, expect, it } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  it('should serialize', () => {
    const header = new Header(
      1234,
      {
        QR: 'query',
        Opcode: Header.Flags.Opcode.QUERY,
        AA: false,
        TC: false,
        RD: false,
        RA: false,
        RCODE: 0,
      },
      {
        question: 1,
        answer: 0,
        authority: 0,
        additional: 0,
      },
    );
    expect(
      Array.from(header.serialize())
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' '),
    ).toMatchInlineSnapshot(`"04 d2 00 00 00 01 00 00 00 00 00 00"`);
  });
});
