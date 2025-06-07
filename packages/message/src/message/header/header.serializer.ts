import { Byte } from '../../common/byte';
import { Header } from './header';

export class HeaderSerializer {
  static id(id: number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(id, 0);
    return buffer;
  }

  static flags(flags: Header.Flags) {
    const flagBytes = [new Byte(), new Byte()];
    flagBytes[0].write(flags.QR === 'query' ? 0 : 1, 0);
    flagBytes[0].write(flags.Opcode, 1);
    flagBytes[0].write(flags.AA ? 1 : 0, 5);
    flagBytes[0].write(flags.TC ? 1 : 0, 6);
    flagBytes[0].write(flags.RD ? 1 : 0, 7);
    flagBytes[1].write(flags.RA ? 1 : 0, 0);
    // flagBytes[1].write(0, 1); // Z
    flagBytes[1].write(flags.RCODE, 4);
    return Buffer.from(flagBytes.map((byte) => byte.read(0, 8)));
  }

  static count(count: number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(count, 0);
    return buffer;
  }
}
