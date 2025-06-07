import { Name } from '../../common/name';

export class ResourceRecordSerializer {
  static name(name: string) {
    return Name.serialize(name);
  }

  static type(type: number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(type, 0);
    return buffer;
  }

  static class(_class: number) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(_class, 0);
    return buffer;
  }

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
