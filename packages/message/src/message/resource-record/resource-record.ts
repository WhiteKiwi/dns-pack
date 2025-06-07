import { Serializable } from '../../common/serializable';
import { DnsClass } from '../../common/types/class';
import { DnsType } from '../../common/types/type';
import { ResourceRecordA } from './impl/a.resource-record';
import { ResourceRecordOPT } from './impl/opt.resource-record';
import { ResourceRecordParser } from './resource-record.parser';

export interface ResourceRecord<T extends Serializable = Serializable> {
  name: string;
  type: number;
  class: number;
  ttl: number;
  data: T;

  serialize(): Buffer;
}

export namespace ResourceRecord {
  export const Type = DnsType;
  export const Class = DnsClass;

  export const Parser = ResourceRecordParser;

  // records
  export const A = ResourceRecordA;
  export const OPT = ResourceRecordOPT;
}
