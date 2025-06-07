import { Name } from '../../common/name';
import { Serializable } from '../../common/serializable';
import { QuestionParser } from './question.parser';

export class Question implements Serializable {
  public readonly class: number;
  private constructor(public readonly name: string, public readonly type: number, _class: number) {
    this.class = _class;
  }

  static of(question: { name: string; type: number; class: number }) {
    return new Question(question.name, question.type, question.class);
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
    return Buffer.concat([
      Name.serialize(this.name),
      QuestionSerializer.type(this.type),
      QuestionSerializer.class(this.class),
    ]);
  }
}

class QuestionSerializer {
  static type(type: number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(type, 0);
    return buffer;
  }

  static class(_class: number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(_class, 0);
    return buffer;
  }
}
