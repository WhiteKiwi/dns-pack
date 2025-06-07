import { describe, expect, it } from 'vitest';
import { DnsClass } from '../../common/types/class';
import { DnsType } from '../../common/types/type';
import { HexReadable } from '../../common/utils/hex-readable';
import { Question } from './question';

describe('Question', () => {
  it('should serialize', () => {
    const question = Question.of({
      name: 'example.com.',
      type: DnsType.A,
      class: DnsClass.IN,
    });
    expect(HexReadable.fromBuffer(question.serialize())).toMatchInlineSnapshot(`
      "07 65 78 61  6d 70 6c 65  03 63 6f 6d  00 00 01 00
      01"
    `);
  });

  it('should deserialize', () => {
    const serialized = HexReadable.toBuffer(
      `07 65 78 61  6d 70 6c 65  03 63 6f 6d  00 00 01 00
      01`,
    );
    const { question } = Question.parse(serialized, 0);
    expect(question.name).toBe('example.com.');
    expect(question.type).toBe(DnsType.A);
    expect(question.class).toBe(DnsClass.IN);
  });
});
