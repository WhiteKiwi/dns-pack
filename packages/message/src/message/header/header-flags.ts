import { Byte } from '../../common/byte';
import { Enum } from '../../common/enum';

const Opcode = Enum('Opcode', { QUERY: 0 });

export namespace HeaderFlags {
  export namespace Opcode {
    export type Readable = Enum.KeyOf<typeof Opcode>;
  }
}

export class HeaderFlags {
  static Opcode = Opcode;

  private constructor(private readonly bytes: [Byte, Byte]) {}

  static of(flags: {
    QR: 'query' | 'response';
    OPCODE: HeaderFlags.Opcode.Readable;
    AA: boolean;
    TC: boolean;
    RD: boolean;
    RA: boolean;
    Z: boolean;
    AD: boolean;
    CD: boolean;
    RCODE: number;
  }): HeaderFlags {
    const bytes: [Byte, Byte] = [new Byte(0), new Byte(0)];
    bytes[0]
      .write(0, 1, flags.QR === 'query' ? 0 : 1)
      .write(1, 4, Opcode[flags.OPCODE])
      .write(5, 1, flags.AA ? 1 : 0)
      .write(6, 1, flags.TC ? 1 : 0)
      .write(7, 1, flags.RD ? 1 : 0);
    bytes[1]
      .write(0, 1, flags.RA ? 1 : 0)
      .write(1, 1, flags.Z ? 1 : 0)
      .write(2, 1, flags.AD ? 1 : 0)
      .write(3, 1, flags.CD ? 1 : 0)
      .write(4, 4, flags.RCODE);
    return new HeaderFlags(bytes);
  }

  static deserialize(serialized: Buffer): HeaderFlags {
    return new HeaderFlags([new Byte(serialized.readUInt8(0)), new Byte(serialized.readUInt8(1))]);
  }

  serialize(): Buffer {
    return Buffer.from(this.bytes.map((byte) => byte.read(0, 8)));
  }

  get QR(): 'query' | 'response' {
    return this.bytes[0].read(0, 1) === 1 ? 'response' : 'query';
  }

  get OPCODE(): number {
    return this.bytes[0].read(1, 4);
  }

  get AA(): boolean {
    return this.bytes[0].read(5, 1) === 1;
  }

  get TC(): boolean {
    return this.bytes[0].read(6, 1) === 1;
  }

  get Z(): boolean {
    return this.bytes[0].read(7, 1) === 1;
  }

  get RD(): boolean {
    return this.bytes[0].read(7, 1) === 1;
  }

  get RA(): boolean {
    return this.bytes[1].read(0, 1) === 1;
  }

  get AD(): boolean {
    return this.bytes[1].read(2, 1) === 1;
  }

  get CD(): boolean {
    return this.bytes[1].read(3, 1) === 1;
  }

  get RCODE(): number {
    return this.bytes[1].read(4, 4);
  }
}
