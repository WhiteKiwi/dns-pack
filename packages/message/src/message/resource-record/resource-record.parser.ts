import { Name } from '../../common/name';

import { Byte } from '../../common/byte';
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
    const { name, offset: next } = this.parseName(buffer, offset);
    offset = next;

    const type = buffer.readUInt16BE(offset);
    offset += 2;

    const _class = buffer.readUInt16BE(offset);
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
            Name.serialize(name),
            ResourceRecordSerializer.type(type),
            ResourceRecordSerializer.class(_class),
            ResourceRecordSerializer.ttl(ttl),
            ResourceRecordSerializer.data(data),
          ]);
        },
      },
      offset,
    };
  }

  private static parseName(buffer: Buffer, offset: number): { name: string; offset: number } {
    const labels: string[] = [];
    while (true) {
      const lengthOctet = new Byte(buffer.readUInt8(offset));
      offset += 1;

      if (lengthOctet.read(0, 8) === 0) {
        return { name: labels.map((label) => `${label}.`).join(''), offset };
      }

      // standard label
      if (lengthOctet.read(0, 2) === 0b00) {
        const byteLength = lengthOctet.read(2, 6);
        const label = buffer.subarray(offset, offset + byteLength);
        labels.push(label.toString('ascii'));
        offset += byteLength;
      }
      // pointer label
      else if (lengthOctet.read(0, 2) === 0b11) {
        const pointer = buffer.readUInt8(offset);
        const name = this.resolvePointerLabel(buffer, pointer);
        offset += 1;
        return { name, offset };
      }
      // unexpected label
      else {
        throw new Error(`Invalid length octet: ${lengthOctet.read(0, 2)}`);
      }
    }
  }

  private static resolvePointerLabel(buffer: Buffer, offset: number): string {
    const { name } = this.parseName(buffer, offset);
    return name;
  }
}
