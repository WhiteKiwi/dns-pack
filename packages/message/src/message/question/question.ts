import { Name } from '../../common/name';
import { Serializable } from '../../common/serializable';
import { ResourceRecord } from '../resource-record/resource-record';
import { QuestionParser } from './question.parser';

export class Question implements Serializable {
  public readonly class: ResourceRecord.Class;
  private constructor(
    public readonly name: Name,
    public readonly type: ResourceRecord.Type,
    _class: ResourceRecord.Class,
  ) {
    this.class = _class;
  }

  static of(question: {
    name: string;
    type: ResourceRecord.Type.Readable;
    class: ResourceRecord.Class.Readable;
  }) {
    return new Question(
      Name.of(question.name),
      ResourceRecord.Type[question.type],
      ResourceRecord.Class[question.class],
    );
  }

  static parse(
    buffer: Buffer,
    offset: number,
  ): {
    question: Question;
    offset: number;
  } {
    const { question, offset: next } = QuestionParser.parse(buffer, offset);

    return {
      question: new Question(question.name, question.type, question.class),
      offset: next,
    };
  }

  serialize() {
    return Buffer.concat([this.name.serialize(), this.type.serialize(), this.class.serialize()]);
  }
}
