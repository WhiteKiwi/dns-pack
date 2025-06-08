import { describe, expect, it } from 'vitest';
import { HexReadable } from '../../common/utils/hex-readable';
import { ResourceRecord } from '../resource-record/resource-record';
import { Question } from './question';

describe('Question', () => {
  it('should serialize', () => {
    const question = Question.of({
      name: 'example.com.',
      type: 'A',
      class: 'IN',
    });
    expect(HexReadable.fromBuffer(question.serialize())).toMatchInlineSnapshot(`
      "07 65 78 61  6d 70 6c 65    03 63 6f 6d  00 00 01 00
      01"
    `);
  });

  it('should deserialize', () => {
    const serialized = HexReadable.toBuffer(
      `07 65 78 61  6d 70 6c 65    03 63 6f 6d  00 00 01 00
      01`,
    );
    const { question } = Question.parse(serialized, 0);
    expect(question.name.valueOf()).toBe('example.com.');
    expect(question.type.valueOf()).toBe(ResourceRecord.Type.A.valueOf());
    expect(question.class.valueOf()).toBe(ResourceRecord.Class.IN.valueOf());
  });
});
