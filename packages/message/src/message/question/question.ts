import { Name, nameParser } from '../../common/name';
import { Serializable } from '../../common/serializable';
import { TypedBinaryParser } from '../../common/typed-binary-parser';
import { ResourceRecord } from '../resource-record/resource-record';

export namespace Question {
  export type Readable = {
    name: Name.Readable;
    type: ResourceRecord.Type.Readable;
    class: ResourceRecord.Class.Readable;
  };
}
export class Question implements Serializable {
  public readonly class: ResourceRecord.Class;
  private constructor(
    public readonly name: Name,
    public readonly type: ResourceRecord.Type,
    _class: ResourceRecord.Class,
  ) {
    this.class = _class;
  }

  static of(readable: Question.Readable) {
    return new Question(
      Name.of(readable.name),
      ResourceRecord.Type.of(readable.type),
      ResourceRecord.Class.of(readable.class),
    );
  }

  static from(parsed: questionParser.Parsed) {
    return new Question(parsed.name, parsed.type, parsed.class);
  }

  serialize() {
    return Buffer.concat([this.name.serialize(), this.type.serialize(), this.class.serialize()]);
  }
}

namespace questionParser {
  export type Parsed = {
    name: Name;
    type: ResourceRecord.Type;
    class: ResourceRecord.Class;
  };
}
export const questionParser = new TypedBinaryParser<questionParser.Parsed>()
  .nest('name', { type: nameParser, formatter: Name.from })
  .uint16('type', { formatter: ResourceRecord.Type.from })
  .uint16('class', { formatter: ResourceRecord.Class.from });
