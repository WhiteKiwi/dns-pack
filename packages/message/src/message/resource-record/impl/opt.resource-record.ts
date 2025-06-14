import { Name } from '../../../common/name';
import { Serializable } from '../../../common/serializable';
import { TypedBinaryParser } from '../../../common/typed-binary-parser';
import { ResourceRecord } from '../resource-record';
import { ResourceRecordSerializer } from '../resource-record.serializer';

const rootNameBinary = Buffer.from([0x00]);

export class ResourceRecordOPT implements ResourceRecord<Options> {
  public readonly name: Name = Name.of('');
  public readonly type = ResourceRecord.Type.OPT;
  public readonly class: ResourceRecord.Class.Like;

  private constructor(
    private readonly version: number,
    private readonly flags: { DO: boolean },
    udpPayloadSize: number,
    private readonly extendedRCode: number,
    public readonly data: Options,
  ) {
    this.class = new OptClass(udpPayloadSize);
  }

  static of({
    version,
    flags,
    extendedRCode,
    options,
    udpPayloadSize,
  }: {
    version: number;
    flags: { DO: boolean };
    extendedRCode: number;
    options: { code: number; data: Buffer }[];
    udpPayloadSize: number;
  }) {
    return new ResourceRecordOPT(
      version,
      flags,
      udpPayloadSize,
      extendedRCode,
      Options.of(options),
    );
  }

  static from(parsed: ResourceRecord.Like) {
    const ttl = Buffer.alloc(4);
    ttl.writeUInt32BE(parsed.ttl);
    const { extendedRCode, version, DO, Z } = ttlParser.parse(ttl);
    const buffer = parsed.data.serialize();
    if (buffer.length) {
      const { options } = _optionsParser.parse(buffer);
      return new ResourceRecordOPT(version, { DO }, parsed.class.valueOf(), extendedRCode, options);
    }
    return new ResourceRecordOPT(
      version,
      { DO },
      parsed.class.valueOf(),
      extendedRCode,
      Options.of([]),
    );
  }

  // 4바이트 괜찮나?

  get ttl() {
    let ttl = 0;
    // byte 1
    ttl |= this.extendedRCode;
    // byte 2
    ttl <<= 8;
    ttl |= this.version;
    // byte 3
    ttl <<= 8;
    if (this.flags.DO) {
      ttl |= 0b1000_0000;
    }
    // byte 4
    ttl <<= 8;
    return ttl;
  }

  serialize() {
    return Buffer.concat([
      rootNameBinary,
      this.type.serialize(),
      this.class.serialize(),
      ResourceRecordSerializer.ttl(this.ttl),
      ResourceRecordSerializer.data(this.data.serialize()),
    ]);
  }
}

class Options implements Serializable {
  private constructor(public readonly options: { code: number; data: Buffer }[]) {}

  static of(options: { code: number; data: Buffer }[]) {
    return new Options(options);
  }

  serialize() {
    return Buffer.concat(this.options.map((option) => this.serializeOption(option)));
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

class OptClass implements ResourceRecord.Class.Like {
  constructor(public readonly udpPayloadSize: number) {}

  serialize() {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(this.udpPayloadSize, 0);
    return buffer;
  }

  valueOf(): number {
    return this.udpPayloadSize;
  }

  toJSON(): string {
    return `UdpPayloadSize(${this.udpPayloadSize})`;
  }
}

const ttlParser = new TypedBinaryParser<{
  extendedRCode: number;
  version: number;
  DO: boolean;
  Z: boolean;
}>()
  .uint8('extendedRCode')
  .uint8('version')
  .bit1('DO')
  .bit15('Z');
ttlParser.compile();

const optionParser = new TypedBinaryParser<{ code: number; data: Buffer }>()
  .endianness('big')
  .uint16('code')
  .uint16('dataLength')
  .buffer('data', { length: 'dataLength' });
const _optionsParser = new TypedBinaryParser<{ options: Options }>()
  .endianness('big')
  .array('options', {
    type: optionParser,
    // note: 사용 시 주의
    readUntil: 'eof',
    formatter: Options.of,
  });
_optionsParser.compile();
