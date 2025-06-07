import { describe, expect, it } from 'vitest';
import { Byte } from './byte';

describe('Byte', () => {
  it('should write and read', () => {
    {
      const byte = new Byte(0);
      byte.write(0, 1, 1);

      expect(byte.read(0, 8).toString(2).padStart(8, '0')).toMatchInlineSnapshot(`"10000000"`);
    }

    {
      const byte = new Byte(0);
      byte.write(0, 2, 3);
      expect(byte.read(0, 8).toString(2).padStart(8, '0')).toMatchInlineSnapshot(`"11000000"`);
    }

    {
      const byte = new Byte(0);
      byte.write(2, 3, 5);
      expect(byte.read(0, 8).toString(2).padStart(8, '0')).toMatchInlineSnapshot(`"00101000"`);
      expect(byte.read(2, 3).toString(2).padStart(3, '0')).toMatchInlineSnapshot(`"101"`);
    }
  });

  it('should throw error', () => {
    const byte = new Byte(0);
    expect(() => byte.write(-1, 1, 0)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Byte: start -1 must be non-negative]`,
    );
    expect(() => byte.write(7, 2, 0)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Byte: start 7 + length 2 exceeds byte size (8)]`,
    );
    expect(() => byte.write(0, 1, -1)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Byte: Value -1 must be non-negative]`,
    );
    expect(() => byte.write(0, 8, 256)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Byte: Value 256 exceeds max 255]`,
    );
  });
});
