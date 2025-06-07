import { describe, expect, it } from 'vitest';
import { DnsClass } from '../../common/types/class';
import { DnsType } from '../../common/types/type';
import { Question } from './question';

describe('Question', () => {
  it('should serialize', () => {
    const question = new Question('example.com', DnsType.A, DnsClass.IN);
    expect(
      Array.from(question.serialize())
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' '),
    ).toMatchInlineSnapshot(`"07 65 78 61 6d 70 6c 65 03 63 6f 6d 00 01 00 01"`);
  });
});
