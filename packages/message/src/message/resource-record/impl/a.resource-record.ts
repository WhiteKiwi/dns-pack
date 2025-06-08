import { IPv4 } from '../../../common/ipv4';
import { Name } from '../../../common/name';
import { ResourceRecord } from '../resource-record';
import { ResourceRecordSerializer } from '../resource-record.serializer';

export class ResourceRecordA implements ResourceRecord<IPv4> {
  public readonly type: ResourceRecord.Type = ResourceRecord.Type.A;
  public readonly class: ResourceRecord.Class;
  public readonly data: IPv4;

  private constructor(
    public readonly name: Name,
    _class: ResourceRecord.Class,
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
    class: ResourceRecord.Class.Readable;
    ttl: number;
    ipv4: string;
  }) {
    return new ResourceRecordA(Name.of(name), ResourceRecord.Class[_class], ttl, ipv4);
  }

  serialize() {
    return Buffer.concat([
      this.name.serialize(),
      this.type.serialize(),
      this.class.serialize(),
      ResourceRecordSerializer.ttl(this.ttl),
      ResourceRecordSerializer.data(this.data.serialize()),
    ]);
  }
}
