import { describe, expect, it } from 'vitest';
import { IPv4 } from './ipv4';

describe('IPv4', () => {
  it('should serialize', () => {
    const ipv4 = new IPv4('192.168.1.1');
    expect(ipv4.serialize()).toEqual(Buffer.from([192, 168, 1, 1]));
  });
});
