import { describe, expect, it } from 'vitest';
import { Name } from './name';

describe('Name', () => {
  it('should serialize a name', () => {
    const name = 'example.com.';
    const serialized = Name.serialize(name);
    expect(Array.from(serialized)).toMatchInlineSnapshot(`
      [
        7,
        101,
        120,
        97,
        109,
        112,
        108,
        101,
        3,
        99,
        111,
        109,
        0,
      ]
    `);
  });

  it('should serialize empty name', () => {
    const name = '';
    const serialized = Name.serialize(name);
    expect(Array.from(serialized)).toMatchInlineSnapshot(`
      [
        0,
      ]
    `);
  });
});
