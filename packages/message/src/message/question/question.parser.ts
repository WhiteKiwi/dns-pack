import { Name } from '../../common/name';
import { ResourceRecord } from '../resource-record/resource-record';

export class QuestionParser {
  private constructor() {}

  static parse(buffer: Buffer, offset: number) {
    const { name, offset: nextOffset } = Name.parse(buffer, offset);
    offset = nextOffset;

    const type = ResourceRecord.Type.deserialize(buffer.subarray(offset, offset + 2));
    offset += 2;

    const _class = ResourceRecord.Class.deserialize(buffer.subarray(offset, offset + 2));
    offset += 2;

    return {
      question: {
        name,
        type,
        class: _class,
      },
      offset,
    };
  }
}
