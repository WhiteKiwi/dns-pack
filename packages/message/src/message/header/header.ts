import { Serializable } from '../../common/serializable';
import { TypedBinaryParser } from '../../common/typed-binary-parser';
import { HeaderFlags, headerFlagsParser } from './header-flags';

export namespace Header {
  export type Flags = HeaderFlags;
  export namespace Flags {
    export type Readable = HeaderFlags.Readable;
  }
  export type Readable = {
    id: number;
    flags: Header.Flags.Readable;
    count: {
      question: number;
      answer: number;
      authority: number;
      additional: number;
    };
  };
}

export class Header implements Serializable {
  private constructor(
    public readonly id: number,
    public readonly flags: Header.Flags,
    public readonly count: {
      question: number;
      answer: number;
      authority: number;
      additional: number;
    },
  ) {}

  static of(readable: Header.Readable) {
    return new Header(readable.id, HeaderFlags.of(readable.flags), readable.count);
  }

  static from(parsed: headerParser.Parsed) {
    return new Header(parsed.id, parsed.flags, parsed.count);
  }

  static Flags = HeaderFlags;

  serialize() {
    return Buffer.from([
      ...HeaderSerializer.id(this.id),
      ...this.flags.serialize(),
      ...HeaderSerializer.count(this.count.question),
      ...HeaderSerializer.count(this.count.answer),
      ...HeaderSerializer.count(this.count.authority),
      ...HeaderSerializer.count(this.count.additional),
    ]);
  }
}

class HeaderSerializer {
  static id(id: number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(id, 0);
    return buffer;
  }

  static count(count: number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(count, 0);
    return buffer;
  }
}

namespace headerParser {
  export type Parsed = {
    id: number;
    flags: Header.Flags;
    count: {
      question: number;
      answer: number;
      authority: number;
      additional: number;
    };
  };
}
export const headerParser = new TypedBinaryParser<Header>().nest({
  type: new TypedBinaryParser<headerParser.Parsed>()
    .uint16('id')
    .nest('flags', { type: headerFlagsParser, formatter: Header.Flags.from })
    .nest('count', {
      type: new TypedBinaryParser<headerParser.Parsed['count']>()
        .uint16('question')
        .uint16('answer')
        .uint16('authority')
        .uint16('additional'),
    }),
  formatter: Header.from,
});
headerParser.compile();
