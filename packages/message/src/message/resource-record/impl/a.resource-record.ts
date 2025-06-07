import { ResourceRecord } from '../resource-record';
import { ResourceRecordSerializer } from '../resource-record.serializer';

export namespace ResourceRecordA {
  export class IN {
    constructor(
      public readonly name: string,
      public readonly ttl: number,
      public readonly ipv4: string,
    ) {}

    serialize() {
      return Buffer.concat([
        ResourceRecordSerializer.name(this.name),
        ResourceRecordSerializer.type(ResourceRecord.Type.A),
        ResourceRecordSerializer.class(ResourceRecord.Class.IN),
        ResourceRecordSerializer.ttl(this.ttl),
        ResourceRecordSerializer.data(this.serializeData()),
      ]);
    }

    private serializeData() {
      return Buffer.concat(
        this.ipv4.split('.').map((part) => {
          const buffer = Buffer.alloc(1);
          buffer.writeUInt8(Number(part), 0);
          return buffer;
        }),
      );
    }
  }
}
