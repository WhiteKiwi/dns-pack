import { Serializable } from './serializable';

export class IPv4 implements Serializable {
  constructor(private readonly address: string) {}

  serialize() {
    const buffer = Buffer.alloc(4);

    const [a, b, c, d] = this.address.split('.');

    buffer.writeUInt8(Number(a), 0);
    buffer.writeUInt8(Number(b), 1);
    buffer.writeUInt8(Number(c), 2);
    buffer.writeUInt8(Number(d), 3);

    return buffer;
  }
}
