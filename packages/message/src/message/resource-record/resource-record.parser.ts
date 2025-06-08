import { Name } from '../../common/name';
import { ResourceRecord } from './resource-record';
import { ResourceRecordSerializer } from './resource-record.serializer';

export class ResourceRecordParser {
  private constructor() {}

  static parse(
    buffer: Buffer,
    offset: number,
  ): {
    resourceRecord: ResourceRecord;
    offset: number;
  } {
    const { name, offset: next } = Name.parse(buffer, offset);
    offset = next;

    const type = ResourceRecord.Type.deserialize(buffer.subarray(offset, offset + 2));
    offset += 2;

    const _class = ResourceRecord.Class.deserialize(buffer.subarray(offset, offset + 2));
    offset += 2;

    const ttl = buffer.readUInt32BE(offset);
    offset += 4;

    const dataLength = buffer.readUInt16BE(offset);
    offset += 2;

    const data = buffer.subarray(offset, offset + dataLength);
    offset += dataLength;

    return {
      resourceRecord: {
        name,
        type,
        class: _class,
        ttl,
        data: { serialize: () => data },
        serialize: () => {
          return Buffer.concat([
            name.serialize(),
            type.serialize(),
            _class.serialize(),
            ResourceRecordSerializer.ttl(ttl),
            ResourceRecordSerializer.data(data),
          ]);
        },
      },
      offset,
    };
  }
}
