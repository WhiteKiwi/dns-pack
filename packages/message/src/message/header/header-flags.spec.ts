import { describe, expect, it } from 'vitest';
import { HexReadable } from '../../common/utils/hex-readable';
import { Header } from './header';
import { headerFlagsParser } from './header-flags';

describe('HeaderFlags', () => {
  it('should serialize 1', () => {
    const flags = Header.Flags.from({
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
    });
    expect(HexReadable.fromBuffer(flags.serialize())).toMatchInlineSnapshot(`"00 00"`);
  });

  it('should serialize 2', () => {
    const flags = Header.Flags.from({
      QR: 'response',
      OPCODE: Header.Flags.Opcode.QUERY.valueOf(),
      AA: true,
      TC: true,
      RD: true,
      RA: true,
      Z: true,
      AD: true,
      CD: true,
      RCODE: 15,
    });
    expect(HexReadable.fromBuffer(flags.serialize())).toMatchInlineSnapshot(`"87 ff"`);
  });

  it('should parse', () => {
    const serialized = HexReadable.toBuffer('87 ff');
    const flags = Header.Flags.from(headerFlagsParser.parse(serialized));
    expect(flags.QR).toBe('response');
    expect(flags.OPCODE).toBe(Header.Flags.Opcode.QUERY);
    expect(flags.AA).toBe(true);
    expect(flags.TC).toBe(true);
    expect(flags.RD).toBe(true);
    expect(flags.RA).toBe(true);
    expect(flags.Z).toBe(true);
    expect(flags.AD).toBe(true);
    expect(flags.CD).toBe(true);
    expect(flags.RCODE).toBe(15);
  });
});
