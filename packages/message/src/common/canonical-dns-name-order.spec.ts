import { describe, expect, it } from 'vitest';
import { canonicalizeDnsNameOrder } from './canonical-dns-name-order';
import { Name } from './name';

/**
 * 
example
a.example
yljkjljk.a.example
Z.a.example
zABC.a.EXAMPLE
z.example
\001.z.example
*.z.example
\200.z.example
 */

describe('canonicalizeDnsNameOrder', () => {
  it('test', () => {
    const a = Name.of('\x01.');
    const b = Name.of('\x80.');
    console.log(canonicalizeDnsNameOrder(a, b));
  });

  it('should canonicalize dns name order', () => {
    const cases: Name[] = [
      Name.of('example.'),
      Name.of('a.example.'),
      Name.of('yljkjljk.a.example.'),
      Name.of('Z.a.example.'),
      Name.of('zABC.a.EXAMPLE.'),
      Name.of('z.example.'),
      Name.of('\x01.z.example.'),
      Name.of('*.z.example.'),
      Name.of('\x80.z.example.'),
    ]
      // suffle
      .sort(() => Math.random() - 0.5);

    const sorted = cases.sort(canonicalizeDnsNameOrder);
    expect(sorted.map((name) => name.valueOf())).toMatchInlineSnapshot(`
      [
        "example.",
        "a.example.",
        "yljkjljk.a.example.",
        "Z.a.example.",
        "zABC.a.EXAMPLE.",
        "z.example.",
        ".z.example.",
        "*.z.example.",
        ".z.example.",
      ]
    `);
  });
});
