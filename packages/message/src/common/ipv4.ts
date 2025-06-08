import { Serializable } from './serializable';

export class IPv4 implements Serializable {
  private constructor(private readonly address: string) {}

  static of(address: string) {
    return new IPv4(address);
  }

  static deserialize(serialized: Buffer) {
    const address = Array.from(serialized)
      .map((byte) => byte.toString(10))
      .join('.');
    return new IPv4(address);
  }

  serialize() {
    const buffer = Buffer.alloc(4);

    const [a, b, c, d] = this.address.split('.');

    buffer.writeUInt8(Number(a), 0);
    buffer.writeUInt8(Number(b), 1);
    buffer.writeUInt8(Number(c), 2);
    buffer.writeUInt8(Number(d), 3);

    return buffer;
  }

  valueOf() {
    return this.address;
  }
}
