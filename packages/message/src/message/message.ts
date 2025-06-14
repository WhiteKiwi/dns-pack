import { map } from 'ramda';
import { Serializable } from '../common/serializable';
import { TypedBinaryParser } from '../common/typed-binary-parser';
import { Header, headerParser } from './header/header';
import { Question, questionParser } from './question/question';
import { ResourceRecord, resourceRecordParser } from './resource-record/resource-record';

export class DnsMessage implements Serializable {
  private constructor(
    public readonly header: Header,
    public readonly questions: Question[],
    public readonly answers: ResourceRecord[],
    public readonly authorities: ResourceRecord[],
    public readonly additional: ResourceRecord[],
  ) {}

  static from(parsed: dnsMessageParser.Parsed) {
    return new DnsMessage(
      parsed.header,
      parsed.questions,
      parsed.answers,
      parsed.authorities,
      parsed.additional,
    );
  }

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
      Header.from({
        id,
        flags,
        count: {
          question: questions.length,
          answer: 0,
          authority: 0,
          additional: additional.length,
        },
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

  static parse(buffer: Buffer): DnsMessage {
    return dnsMessageParser.parse(buffer);
  }
}

namespace dnsMessageParser {
  export type Parsed = {
    header: Header;
    questions: Question[];
    answers: ResourceRecord[];
    authorities: ResourceRecord[];
    additional: ResourceRecord[];
  };
}
const dnsMessageParser = new TypedBinaryParser<DnsMessage>().nest({
  type: new TypedBinaryParser<dnsMessageParser.Parsed>()
    .nest('header', { type: headerParser })
    .array('questions', {
      type: questionParser,
      length: 'header.count.question',
      formatter: map(Question.from),
    })
    .array('answers', {
      type: resourceRecordParser,
      length: 'header.count.answer',
      formatter: map(ResourceRecord.from),
    })
    .array('authorities', {
      type: resourceRecordParser,
      length: 'header.count.authority',
      formatter: map(ResourceRecord.from),
    })
    .array('additional', {
      type: resourceRecordParser,
      length: 'header.count.additional',
      formatter: map(ResourceRecord.from),
    }),
  formatter: DnsMessage.from,
});
dnsMessageParser.compile();
