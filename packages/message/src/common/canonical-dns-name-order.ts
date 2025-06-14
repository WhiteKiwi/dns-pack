import { Name } from './name';

/**
 * https://datatracker.ietf.org/doc/html/rfc4034#section-6.1
 */
export function canonicalizeDnsNameOrder(a: Name, b: Name): number {
  for (let i = 0; i < a.labels.length; i++) {
    // The absence of a octet sorts before a zero value octet ...
    if (b.labels.length <= i) {
      return 1;
    }

    // ... uppercase US-ASCII letters are treated as if they were lowercase US-ASCII letters
    const compared = Buffer.compare(
      toLowerCasedBuffer(a.labels.at(-(i + 1))!),
      toLowerCasedBuffer(b.labels.at(-(i + 1))!),
    );

    if (compared !== 0) {
      return compared;
    }
  }

  return a.labels.length - b.labels.length;
}

const cache = new WeakMap<Name.Label.Standard, Buffer>();
function toLowerCasedBuffer(label: Name.Label.Standard): Buffer {
  if (cache.has(label)) {
    return cache.get(label)!;
  }
  const buffer = Buffer.from(label.valueOf().toLowerCase());
  cache.set(label, buffer);
  return buffer;
}
