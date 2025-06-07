import { HeaderSerializer } from './header.serializer';

enum Opcode {
  QUERY = 0,
}

class Flags {
  static Opcode = Opcode;
}

export class Header {
  constructor(
    public readonly id: number,
    public readonly flags: Header.Flags,
    public readonly count: {
      question: number;
      answer: number;
      authority: number;
      additional: number;
    },
  ) {}

  static Flags = Flags;

  serialize() {
    return Buffer.from([
      ...HeaderSerializer.id(this.id),
      ...HeaderSerializer.flags(this.flags),
      ...HeaderSerializer.count(this.count.question),
      ...HeaderSerializer.count(this.count.answer),
      ...HeaderSerializer.count(this.count.authority),
      ...HeaderSerializer.count(this.count.additional),
    ]);
  }
}

export namespace Header {
  export type Flags = {
    QR: 'query' | 'response';
    Opcode: number;
    AA: boolean;
    TC: boolean;
    RD: boolean;
    RA: boolean;
    RCODE: number;
  };
}
