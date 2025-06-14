import { describe, expect, it } from 'vitest';
import { HexReadable } from '../../common/utils/hex-readable';
import { ResourceRecord, resourceRecordParser } from '../resource-record/resource-record';

describe('ResourceRecord', () => {
  it('should serialize', () => {
    const resourceRecord = ResourceRecord.A.of({
      name: 'example.com.',
      class: 'IN',
      ttl: 3600,
      ipv4: '192.168.1.1',
    });
    expect(HexReadable.fromBuffer(resourceRecord.serialize())).toMatchInlineSnapshot(`
      "07 65 78 61  6d 70 6c 65    03 63 6f 6d  00 00 01 00
      01 00 00 0e  10 00 04 c0    a8 01 01"
    `);
  });

  it('should parse', () => {
    const serialized = HexReadable.toBuffer(
      `07 65 78 61  6d 70 6c 65    03 63 6f 6d  00 00 01 00
      01 00 00 0e  10 00 04 c0    a8 01 01`,
    );

    const parsed = resourceRecordParser.parse(serialized);
    const rr = ResourceRecord.A.from(parsed);
    expect(rr.name.valueOf()).toBe('example.com.');
    expect(rr.type.valueOf()).toBe(ResourceRecord.Type.A.valueOf());
    expect(rr.class.valueOf()).toBe(ResourceRecord.Class.IN.valueOf());
    expect(rr.ttl).toBe(3600);
    expect(rr.data.valueOf()).toBe('192.168.1.1');
  });
});
