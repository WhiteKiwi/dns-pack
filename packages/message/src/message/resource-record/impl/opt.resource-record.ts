import { Byte } from '../../../common/byte';
import { ResourceRecord } from '../resource-record';
import { ResourceRecordSerializer } from '../resource-record.serializer';

const NAME = Buffer.from([0x00]);

export class ResourceRecordOPT {
  constructor(
    private readonly version: number,
    private readonly options: {
      code: number;
      data: Buffer;
    }[],
    private readonly extendedRCode: number,
    private readonly flags: { DO: boolean },
    private readonly requestorUdpPayloadSize: number,
  ) {}

  serialize() {
    return Buffer.concat([
      NAME,
      ResourceRecordSerializer.type(ResourceRecord.Type.OPT),
      ResourceRecordSerializer.class(this.requestorUdpPayloadSize),
      this.serializeTtl({
        version: this.version,
        extendedRCode: this.extendedRCode,
        flags: this.flags,
      }),
      this.serializeOptions(this.options),
    ]);
  }

  private serializeTtl({
    version,
    extendedRCode,
    flags,
  }: {
    version: number;
    extendedRCode: number;
    flags: { DO: boolean };
  }) {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt8(extendedRCode, 0);
    buffer.writeUInt8(version, 1);
    const flagByte = new Byte();
    flagByte.write(flags.DO ? 1 : 0, 0);
    buffer.writeUInt8(flagByte.read(0, 8), 2);
    return buffer;
  }

  private serializeOptions(options: { code: number; data: Buffer }[]) {
    const length = Buffer.alloc(2);
    length.writeUInt16BE(options.length, 0);
    return Buffer.concat([length, ...options.map((option) => this.serializeOption(option))]);
  }

  private serializeOption({ code, data }: { code: number; data: Buffer }) {
    const optionCodeBuffer = Buffer.alloc(2);
    optionCodeBuffer.writeUInt16BE(code, 0);

    const optionLengthBuffer = Buffer.alloc(2);
    optionLengthBuffer.writeUInt16BE(data.byteLength, 0);

    const buffers: Buffer[] = [optionCodeBuffer, optionLengthBuffer, data];
    return Buffer.concat(buffers);
  }
}
