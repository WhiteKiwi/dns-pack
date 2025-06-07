import { Byte } from '../../common/byte';

export class QuestionParser {
  private constructor() {}

  static parse(buffer: Buffer, offset: number) {
    const { name, offset: nextOffset } = this.parseName(buffer, offset);
    offset = nextOffset;

    const type = buffer.readUInt16BE(offset);
    offset += 2;

    const _class = buffer.readUInt16BE(offset);
    offset += 2;

    return {
      question: {
        name,
        type,
        class: _class,
      },
      offset,
    };
  }

  private static parseName(buffer: Buffer, offset: number): { name: string; offset: number } {
    const labels: string[] = [];
    while (true) {
      const lengthOctet = new Byte(buffer.readUInt8(offset));
      offset += 1;

      if (lengthOctet.read(0, 8) === 0) {
        return { name: labels.map((label) => `${label}.`).join(''), offset };
      }

      // standard label
      if (lengthOctet.read(0, 2) === 0b00) {
        const byteLength = lengthOctet.read(2, 6);
        const label = buffer.subarray(offset, offset + byteLength);
        labels.push(label.toString('ascii'));
        offset += byteLength;
      }
      // pointer label
      else if (lengthOctet.read(0, 2) === 0b11) {
        const name = this.resolvePointerLabel(buffer, offset);
        offset += 1;
        return { name, offset };
      }
      // unexpected label
      else {
        throw new Error(`Invalid length octet: ${lengthOctet.read(0, 2)}`);
      }
    }
  }

  private static resolvePointerLabel(buffer: Buffer, offset: number): string {
    const { name } = this.parseName(buffer, offset);
    return name;
  }
}
