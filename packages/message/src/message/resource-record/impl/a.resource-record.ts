import { IPv4 } from '../../../common/ipv4';
import { Name } from '../../../common/name';
import { ResourceRecord } from '../resource-record';
import { ResourceRecordSerializer } from '../resource-record.serializer';

export class ResourceRecordA implements ResourceRecord<IPv4> {
  public readonly type: number = ResourceRecord.Type.A;
  public readonly data: IPv4;
  public readonly class: number;

  constructor(
    public readonly name: string,
    _class: number,
    public readonly ttl: number,
    public readonly ipv4: string,
  ) {
    this.data = new IPv4(ipv4);
    this.class = _class;
  }

  static of({
    name,
    class: _class,
    ttl,
    ipv4,
  }: {
    name: string;
    class: number;
    ttl: number;
    ipv4: string;
  }) {
    return new ResourceRecordA(name, _class, ttl, ipv4);
  }

  serialize() {
    return Buffer.concat([
      Name.serialize(this.name),
      ResourceRecordSerializer.type(ResourceRecord.Type.A),
      ResourceRecordSerializer.class(ResourceRecord.Class.IN),
      ResourceRecordSerializer.ttl(this.ttl),
      ResourceRecordSerializer.data(this.data.serialize()),
    ]);
  }
}
