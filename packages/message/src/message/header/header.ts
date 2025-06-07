import { Serializable } from '../../common/serializable';
import { HeaderFlags } from './header-flags';

export namespace Header {
  export type Flags = HeaderFlags;
}

export class Header implements Serializable {
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

  static Flags = HeaderFlags;

  static deserialize(serialized: Buffer): Header {
    const id = serialized.readUInt16BE(0);
    const flags = HeaderFlags.deserialize(serialized.subarray(2, 4));
    const count = {
      question: serialized.readUInt16BE(4),
      answer: serialized.readUInt16BE(6),
      authority: serialized.readUInt16BE(8),
      additional: serialized.readUInt16BE(10),
    };

    return new Header(id, flags, count);
  }

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
