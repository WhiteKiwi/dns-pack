import { Enum } from '../../common/enum';
import { Name } from '../../common/name';
import { Serializable } from '../../common/serializable';
import { ResourceRecordClass, ResourceRecordClassEnum } from './common/resource-record.class';
import { ResourceRecordType, ResourceRecordTypeEnum } from './common/resource-record.type';
import { ResourceRecordA } from './impl/a.resource-record';
import { ResourceRecordOPT } from './impl/opt.resource-record';
import { ResourceRecordParser } from './resource-record.parser';

export interface ResourceRecord<T extends Serializable = Serializable> {
  name: Name;
  type: ResourceRecord.Type.Like;
  class: ResourceRecord.Class.Like;
  ttl: number;
  data: T;

  serialize(): Buffer;
}

export namespace ResourceRecord {
  // type
  type TypeOfType = typeof ResourceRecordType & Record<Type.Readable, ResourceRecordType>;
  export type Type = ResourceRecordType;
  export namespace Type {
    export type Readable = Enum.KeyOf<typeof ResourceRecordTypeEnum>;
    export type Like = ResourceRecordType.Like;
  }
  export const Type: TypeOfType = ResourceRecordType as TypeOfType;
  for (const key of Object.keys(ResourceRecordTypeEnum)) {
    (ResourceRecordType as TypeOfType)[key as Type.Readable] = ResourceRecordType.of(
      ResourceRecordTypeEnum[key as Type.Readable],
    );
  }

  // class
  type TypeOfClass = typeof ResourceRecordClass & Record<Class.Readable, ResourceRecordClass>;
  export type Class = ResourceRecordClass;
  export namespace Class {
    export type Readable = Enum.KeyOf<typeof ResourceRecordClassEnum>;
    export type Like = ResourceRecordClass.Like;
  }
  export const Class: TypeOfClass = ResourceRecordClass as TypeOfClass;
  for (const key of Object.keys(ResourceRecordClassEnum)) {
    (ResourceRecordClass as TypeOfClass)[key as Class.Readable] = ResourceRecordClass.of(
      ResourceRecordClassEnum[key as Class.Readable],
    );
  }

  // parser
  export const Parser = ResourceRecordParser;

  // records
  export const A = ResourceRecordA;
  export const OPT = ResourceRecordOPT;
}
