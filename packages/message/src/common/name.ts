/**
 * https://datatracker.ietf.org/doc/html/rfc1035#section-3.1
 */
export class Name {
  static serialize(name: string) {
    const buffers: Buffer[] = [];
    for (const label of name.split('.')) {
      buffers.push(new Label.Standard(label).serialize());
    }
    return Buffer.concat(buffers);
  }
}

export namespace Label {
  export class Standard {
    constructor(private readonly label: string) {}

    serialize() {
      const lengthOctet = this.getLengthOctet(this.label.length);
      const labelBuffer = Buffer.from(this.label, 'ascii');
      return Buffer.concat([lengthOctet, labelBuffer]);
    }

    private getLengthOctet(length: number) {
      const buffer = Buffer.alloc(1);
      buffer.writeUInt8(0b00111111 & length);
      return buffer;
    }
  }
}
