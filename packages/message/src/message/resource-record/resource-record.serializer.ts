export class ResourceRecordSerializer {
  static ttl(ttl: number) {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(ttl, 0);
    return buffer;
  }

  static data(data: Buffer) {
    const length = Buffer.alloc(2);
    length.writeUInt16BE(data.length, 0);
    return Buffer.concat([length, data]);
  }
}
