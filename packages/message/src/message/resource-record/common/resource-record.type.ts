import { Enum } from '../../../common/enum';

export const ResourceRecordTypeEnum = Enum('Type', {
  A: 1,
  OPT: 41,
  RRSIG: 46,
  DNSKEY: 48,
});

export namespace ResourceRecordType {
  export type Like = Pick<ResourceRecordType, 'serialize' | 'valueOf' | 'toJSON'>;
  export type Readable = Enum.KeyOf<typeof ResourceRecordTypeEnum>;
}

export class ResourceRecordType {
  private constructor(private readonly type: number) {}

  static of(readable: ResourceRecordType.Readable) {
    return new ResourceRecordType(ResourceRecordTypeEnum[readable]);
  }

  static from(type: number) {
    return new ResourceRecordType(type);
  }

  static deserialize(buffer: Buffer): ResourceRecordType {
    return new ResourceRecordType(buffer.readUInt16BE(0));
  }

  serialize(): Buffer {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(this.type, 0);
    return buffer;
  }

  valueOf(): number {
    return this.type;
  }

  toJSON(): string {
    return ResourceRecordTypeEnum.Readable(this.valueOf());
  }
}
