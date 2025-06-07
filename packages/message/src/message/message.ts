import { Serializable } from '../common/serializable';
import { Header } from './header/header';
import { Question } from './question/question';
import { ResourceRecord } from './resource-record/resource-record';

export class DnsMessage implements Serializable {
  private constructor(
    public readonly header: Header,
    public readonly questions: Question[],
    public readonly answers: ResourceRecord[],
    public readonly authorities: ResourceRecord[],
    public readonly additional: ResourceRecord[],
  ) {}

  static Query(
    id: number,
    flags: Header.Flags,
    {
      questions,
      additional,
    }: {
      questions: Question[];
      additional: ResourceRecord[];
    },
  ) {
    return new DnsMessage(
      new Header(id, flags, {
        question: questions.length,
        answer: 0,
        authority: 0,
        additional: additional.length,
      }),
      questions,
      [], // answers
      [], // authorities
      additional,
    );
  }

  serialize() {
    return Buffer.concat([
      this.header.serialize(),
      ...this.questions.map((question) => question.serialize()),
      ...this.answers.map((answer) => answer.serialize()),
      ...this.authorities.map((authority) => authority.serialize()),
      ...this.additional.map((additional) => additional.serialize()),
    ]);
  }

  static parse(buffer: Buffer) {
    const header = Header.deserialize(buffer);
    let offset = 12;
    const questions: Question[] = [];
    for (let i = 0; i < header.count.question; i++) {
      const { question, offset: next } = Question.parse(buffer, offset);
      questions.push(question);
      offset = next;
    }

    const answers: ResourceRecord[] = [];
    for (let i = 0; i < header.count.answer; i++) {
      const { resourceRecord, offset: next } = ResourceRecord.Parser.parse(buffer, offset);
      answers.push(resourceRecord);
      offset = next;
    }

    const authorities: ResourceRecord[] = [];
    for (let i = 0; i < header.count.authority; i++) {
      const { resourceRecord, offset: next } = ResourceRecord.Parser.parse(buffer, offset);
      authorities.push(resourceRecord);
      offset = next;
    }

    const additional: ResourceRecord[] = [];
    for (let i = 0; i < header.count.additional; i++) {
      const { resourceRecord, offset: next } = ResourceRecord.Parser.parse(buffer, offset);
      additional.push(resourceRecord);
      offset = next;
    }

    return new DnsMessage(header, questions, answers, authorities, additional);
  }
}
