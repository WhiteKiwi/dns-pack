import { DnsClass } from '../../common/types/class';
import { DnsType } from '../../common/types/type';
import { ResourceRecordA } from './impl/a.resource-record';
import { ResourceRecordOPT } from './impl/opt.resource-record';

export interface ResourceRecord {
  serialize(): Buffer;
}

export namespace ResourceRecord {
  export const Type = DnsType;
  export const Class = DnsClass;

  // records
  export const A = ResourceRecordA;
  export const OPT = ResourceRecordOPT;
}
