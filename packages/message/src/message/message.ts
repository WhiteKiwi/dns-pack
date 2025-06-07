import { Header } from './header/header';
import { Question } from './question/question';
import { ResourceRecord } from './resource-record/resource-record';

export class DnsMessage {
  private constructor(
    public readonly header: Header,
    public readonly questions: Question[],
    public readonly answers: ResourceRecord[],
    public readonly authorities: ResourceRecord[],
    public readonly additional: ResourceRecord[],
  ) {}

  static create(
    id: number,
    flags: Header.Flags,
    questions: Question[],
    answers: ResourceRecord[],
    authorities: ResourceRecord[],
    additional: ResourceRecord[],
  ) {
    return new DnsMessage(
      new Header(id, flags, {
        question: questions.length,
        answer: answers.length,
        authority: authorities.length,
        additional: additional.length,
      }),
      questions,
      answers,
      authorities,
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
}
