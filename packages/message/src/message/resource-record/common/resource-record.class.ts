import { Enum } from '../../../common/enum';

export const ResourceRecordClassEnum = Enum('Class', {
  IN: 1,
});

export namespace ResourceRecordClass {
  export type Like = Pick<ResourceRecordClass, 'serialize' | 'valueOf' | 'toJSON'>;
  export type Readable = Enum.KeyOf<typeof ResourceRecordClassEnum>;
}

export class ResourceRecordClass {
  private constructor(private readonly _class: number) {}

  static of(readable: ResourceRecordClass.Readable) {
    return new ResourceRecordClass(ResourceRecordClassEnum[readable]);
  }

  static from(_class: number) {
    return new ResourceRecordClass(_class);
  }

  static deserialize(buffer: Buffer): ResourceRecordClass {
    return new ResourceRecordClass(buffer.readUInt16BE(0));
  }

  serialize(): Buffer {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(this._class, 0);
    return buffer;
  }

  valueOf(): number {
    return this._class;
  }

  toJSON(): string {
    return ResourceRecordClassEnum.Readable(this.valueOf());
  }
}
