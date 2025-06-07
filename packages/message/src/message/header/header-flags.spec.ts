import { describe, expect, it } from 'vitest';
import { HexReadable } from '../../common/utils/hex-readable';
import { Header } from './header';

describe('HeaderFlags', () => {
  it('should serialize 1', () => {
    const flags = Header.Flags.of({
      QR: 'query',
      Opcode: Header.Flags.Opcode.QUERY,
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
    const flags = Header.Flags.of({
      QR: 'response',
      Opcode: 0b1111,
      AA: true,
      TC: true,
      RD: true,
      RA: true,
      Z: true,
      AD: true,
      CD: true,
      RCODE: 15,
    });
    expect(HexReadable.fromBuffer(flags.serialize())).toMatchInlineSnapshot(`"ff ff"`);
  });

  it('should deserialize', () => {
    const serialized = HexReadable.toBuffer('ff ff');
    const flags = Header.Flags.deserialize(serialized);
    expect(flags.QR).toBe('response');
    expect(flags.Opcode).toBe(0b1111);
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
