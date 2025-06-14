import { Bind } from '../../common/bind.decorator';
import { Name, nameParser } from '../../common/name';
import { Serializable } from '../../common/serializable';
import { TypedBinaryParser } from '../../common/typed-binary-parser';
import { ResourceRecordClass, ResourceRecordClassEnum } from './common/resource-record.class';
import { ResourceRecordType, ResourceRecordTypeEnum } from './common/resource-record.type';
import { ResourceRecordA } from './impl/a.resource-record';
import { ResourceRecordOPT } from './impl/opt.resource-record';
import { ResourceRecordSerializer } from './resource-record.serializer';

export namespace ResourceRecord {
  export type Like = Pick<ResourceRecord, 'name' | 'type' | 'class' | 'ttl' | 'data'>;

  // type
  export type Type = ResourceRecordType;
  export namespace Type {
    export type Readable = ResourceRecordType.Readable;
    export type Like = ResourceRecordType.Like;
  }

  // class
  export type Class = ResourceRecordClass;
  export namespace Class {
    export type Readable = ResourceRecordClass.Readable;
    export type Like = ResourceRecordClass.Like;
  }
}
type StaticType = typeof ResourceRecordType &
  Record<ResourceRecord.Type.Readable, ResourceRecordType>;
type StaticClass = typeof ResourceRecordClass &
  Record<ResourceRecord.Class.Readable, ResourceRecordClass>;
export class ResourceRecord<T extends Serializable = Serializable>
  implements ResourceRecord<T>, Serializable
{
  public static Class: StaticClass = ResourceRecordClass as StaticClass;
  public static Type: StaticType = ResourceRecordType as StaticType;

  // records
  public static A = ResourceRecordA;
  public static OPT = ResourceRecordOPT;

  public readonly class: ResourceRecord.Class.Like;
  private constructor(
    public readonly name: Name,
    public readonly type: ResourceRecord.Type.Like,
    _class: ResourceRecord.Class.Like,
    public readonly ttl: number,
    public readonly data: T,
  ) {
    this.class = _class;
  }

  private static implements = {
    [ResourceRecordTypeEnum.A]: ResourceRecordA,
    [ResourceRecordTypeEnum.OPT]: ResourceRecordOPT,
  };
  @Bind()
  static from(parsed: ResourceRecord) {
    const implement = this.implements[parsed.type.valueOf()];
    if (implement) {
      return implement.from(parsed);
    }
    return new ResourceRecord(parsed.name, parsed.type, parsed.class, parsed.ttl, parsed.data);
  }

  serialize(): Buffer {
    return Buffer.concat([
      this.name.serialize(),
      this.type.serialize(),
      this.class.serialize(),
      ResourceRecordSerializer.ttl(this.ttl),
      ResourceRecordSerializer.data(this.data.serialize()),
    ]);
  }
}

for (const key of Object.keys(ResourceRecordTypeEnum)) {
  (ResourceRecordType as StaticType)[key as ResourceRecord.Type.Readable] = ResourceRecordType.from(
    ResourceRecordTypeEnum[key as ResourceRecord.Type.Readable],
  );
}

for (const key of Object.keys(ResourceRecordClassEnum)) {
  (ResourceRecordClass as StaticClass)[key as ResourceRecord.Class.Readable] =
    ResourceRecordClass.from(ResourceRecordClassEnum[key as ResourceRecord.Class.Readable]);
}

export const resourceRecordParser = new TypedBinaryParser<ResourceRecord>()
  .endianness('big')
  .nest('name', { type: nameParser, formatter: Name.from })
  .uint16('type', { formatter: ResourceRecord.Type.from })
  .uint16('class', { formatter: ResourceRecord.Class.from })
  .uint32('ttl')
  .uint16('dataLength')
  .buffer('data', {
    length: 'dataLength',
    formatter: (parsed: Buffer) => ({ serialize: () => parsed }),
  });
resourceRecordParser.compile();
