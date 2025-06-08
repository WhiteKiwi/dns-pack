import { Byte } from './byte';
import { Serializable } from './serializable';

/**
 * https://datatracker.ietf.org/doc/html/rfc1035#section-3.1
 */
export class Name {
  private constructor(public readonly labels: Label.Standard[]) {}

  static of(name: string) {
    return new Name(name.split('.').map((label) => new Label.Standard(label)));
  }

  static parse(buffer: Buffer, offset: number): { name: Name; offset: number } {
    const { name, offset: next } = this.parseName(buffer, offset);
    return {
      name: new Name(name.split('.').map((label) => new Label.Standard(label))),
      offset: next,
    };
  }

  serialize(): Buffer {
    const buffers: Buffer[] = [];
    for (const label of this.labels) {
      buffers.push(label.serialize());
    }
    return Buffer.concat(buffers);
  }

  valueOf(): string {
    return this.labels.map((label) => label.valueOf()).join('.');
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
        const name = this.resolvePointerLabel(buffer, buffer.readUInt8(offset));
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

export namespace Label {
  export class Standard implements Serializable {
    constructor(private readonly label: string) {}

    serialize(): Buffer {
      const lengthOctet = this.getLengthOctet(this.label.length);
      const labelBuffer = Buffer.from(this.label, 'ascii');
      return Buffer.concat([lengthOctet, labelBuffer]);
    }

    valueOf(): string {
      return this.label;
    }

    private getLengthOctet(length: number) {
      const buffer = Buffer.alloc(1);
      buffer.writeUInt8(0b00111111 & length);
      return buffer;
    }
  }
}
