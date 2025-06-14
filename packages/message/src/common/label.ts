import { Serializable } from './serializable';
import { TypedBinaryParser } from './typed-binary-parser';

export namespace Label {
  export class Standard implements Serializable {
    constructor(private readonly label: string) {}

    serialize(): Buffer {
      const lengthOctet = this.getLengthOctet(this.label.length);
      const labelBuffer = Buffer.from(this.label, 'ascii');
      return Buffer.concat([lengthOctet, labelBuffer]);
    }

    valueOf(): string {
      return this.label;
    }

    private getLengthOctet(length: number): Buffer {
      const buffer = Buffer.alloc(1);
      buffer.writeUInt8(0b00111111 & length, 0);
      return buffer;
    }
  }
}

type ParsedLabel = ParsedStandardLabel | ParsedPointerLabel;
type ParsedStandardLabel = {
  type: 0b00;
  length: number;
  value: string;
};
type ParsedPointerLabel = {
  type: 0b11;
  length: number;
  offset: number;
  value: string[];
};

export namespace labelsParser {
  export type Parsed = { labels: ParsedLabel[] };
}
export const labelsParser = new TypedBinaryParser<labelsParser.Parsed>().array('labels', {
  type: new TypedBinaryParser<ParsedLabel>()
    .bit2('type')
    .bit6('length')
    .choice({
      tag: function (this: { type: number; length: number }) {
        if (this.type === 0b00 && this.length === 0) {
          return -1;
        }
        return this.type;
      },
      choices: {
        // standard
        0b00: new TypedBinaryParser<{ value: string }>().string('value', {
          length: 'length',
          encoding: 'ascii',
        }),
        // standard - empty
        [-1]: new TypedBinaryParser<void>(),
        // pointer
        0b11: new TypedBinaryParser<{
          offset: number;
          value: ParsedLabel[];
        }>()
          .uint8('offset')
          .pointer('value', {
            type: new TypedBinaryParser<string[]>().array('labels', {
              type: new TypedBinaryParser<{ type: number; length: number; value: string }>()
                .bit2('type')
                .bit6('length')
                .choice({
                  tag: function (this: { type: number; length: number }) {
                    if (this.type === 0b00 && this.length === 0) {
                      return -1;
                    }
                    return this.type;
                  },
                  choices: {
                    // standard
                    0b00: new TypedBinaryParser<{ value: string }>().string('value', {
                      length: 'length',
                      encoding: 'ascii',
                    }),
                    // standard - empty
                    [-1]: new TypedBinaryParser<void>(),
                    // pointer...
                  },
                  formatter: (parsed) => {
                    if (parsed.value === undefined) {
                      parsed.value = '';
                    }
                    return parsed;
                  },
                }),
              readUntil: (label) => label.length === 0,
            }),
            offset: 'offset',
            formatter: (parsed) =>
              parsed.labels.map(
                (label: { type: number; length: number; value: string }) => label.value,
              ),
          }),
      },
      formatter: (parsed) => {
        if (parsed.value === undefined) {
          parsed.value = '';
        }
        return parsed;
      },
    }),
  readUntil: (label) => label.length === 0,
});
labelsParser.compile();
