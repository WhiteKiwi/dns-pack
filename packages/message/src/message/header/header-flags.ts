import { Enum } from '../../common/enum';
import { TypedBinaryParser } from '../../common/typed-binary-parser';

const Opcode = Enum('Opcode', { QUERY: 0 });

export namespace HeaderFlags {
  export type Opcode = number;
  export namespace Opcode {
    export type Readable = Enum.KeyOf<typeof Opcode>;
  }
  export type Readable = Omit<headerFlagsParser.Parsed, 'OPCODE'> & { OPCODE: Opcode.Readable };
}

export class HeaderFlags {
  static Opcode = Opcode;

  private constructor(private readonly parsed: headerFlagsParser.Parsed) {}

  static of(readable: HeaderFlags.Readable) {
    return new HeaderFlags({ ...readable, OPCODE: Opcode[readable.OPCODE] });
  }

  static from(parsed: headerFlagsParser.Parsed): HeaderFlags {
    return new HeaderFlags(parsed);
  }

  serialize(): Buffer {
    const bytes = [0, 0];
    if (this.parsed.QR === 'response') {
      bytes[0] |= 0b1000_0000; // 1 << 7
    }
    bytes[0] |= this.parsed.OPCODE << 3;
    if (this.parsed.AA) {
      bytes[0] |= 0b0000_0100; // 1 << 2
    }
    if (this.parsed.TC) {
      bytes[0] |= 0b0000_0010; // 1 << 1
    }
    if (this.parsed.RD) {
      bytes[0] |= 0b0000_0001; // 1 << 0
    }
    if (this.parsed.RA) {
      bytes[1] |= 0b1000_0000; // 1 << 7
    }
    if (this.parsed.Z) {
      bytes[1] |= 0b0100_0000; // 1 << 6
    }
    if (this.parsed.AD) {
      bytes[1] |= 0b0010_0000; // 1 << 5
    }
    if (this.parsed.CD) {
      bytes[1] |= 0b0001_0000; // 1 << 4
    }
    bytes[1] |= this.parsed.RCODE;
    return Buffer.from(bytes);
  }

  get QR(): 'query' | 'response' {
    return this.parsed.QR;
  }

  get OPCODE(): number {
    return this.parsed.OPCODE;
  }

  get AA(): boolean {
    return this.parsed.AA;
  }

  get TC(): boolean {
    return this.parsed.TC;
  }

  get Z(): boolean {
    return this.parsed.Z;
  }

  get RD(): boolean {
    return this.parsed.RD;
  }

  get RA(): boolean {
    return this.parsed.RA;
  }

  get AD(): boolean {
    return this.parsed.AD;
  }

  get CD(): boolean {
    return this.parsed.CD;
  }

  get RCODE(): number {
    return this.parsed.RCODE;
  }
}

export namespace headerFlagsParser {
  export type Parsed = {
    QR: 'query' | 'response';
    OPCODE: number;
    AA: boolean;
    TC: boolean;
    RD: boolean;
    RA: boolean;
    Z: boolean;
    AD: boolean;
    CD: boolean;
    RCODE: number;
  };
}
export const headerFlagsParser = new TypedBinaryParser<headerFlagsParser.Parsed>()
  .bit1('QR', { formatter: (value) => (value === 0 ? 'query' : 'response') })
  .bit4('OPCODE')
  .bit1('AA', { formatter: (value) => value === 1 })
  .bit1('TC', { formatter: (value) => value === 1 })
  .bit1('RD', { formatter: (value) => value === 1 })
  .bit1('RA', { formatter: (value) => value === 1 })
  .bit1('Z', { formatter: (value) => value === 1 })
  .bit1('AD', { formatter: (value) => value === 1 })
  .bit1('CD', { formatter: (value) => value === 1 })
  .bit4('RCODE');
headerFlagsParser.compile();
