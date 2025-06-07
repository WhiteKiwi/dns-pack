import { describe, expect, it } from 'vitest';
import { Byte } from './byte';

describe('Byte', () => {
  it('should write and read', () => {
    {
      const byte = new Byte();
      byte.write(1, 0);

      expect(byte.read(0, 8).toString(2).padStart(8, '0')).toMatchInlineSnapshot(`"10000000"`);
    }

    {
      const byte = new Byte();
      byte.write(3, 1);
      expect(byte.read(0, 8).toString(2).padStart(8, '0')).toMatchInlineSnapshot(`"11000000"`);
    }

    {
      const byte = new Byte();
      byte.write(5, 4);
      expect(byte.read(0, 8).toString(2).padStart(8, '0')).toMatchInlineSnapshot(`"00101000"`);
      expect(byte.read(2, 3).toString(2).padStart(3, '0')).toMatchInlineSnapshot(`"101"`);
    }
  });
});
