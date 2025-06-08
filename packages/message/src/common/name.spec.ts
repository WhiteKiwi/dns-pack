import { describe, expect, it } from 'vitest';
import { Name } from './name';
import { HexReadable } from './utils/hex-readable';

describe('Name', () => {
  it('should serialize a name', () => {
    const name = Name.of('example.com.');
    const serialized = name.serialize();
    expect(HexReadable.fromBuffer(serialized)).toMatchInlineSnapshot(
      `"07 65 78 61  6d 70 6c 65    03 63 6f 6d  00"`,
    );
  });

  it('should serialize empty name', () => {
    const name = Name.of('');
    const serialized = name.serialize();
    expect(HexReadable.fromBuffer(serialized)).toMatchInlineSnapshot(`"00"`);
  });
});
