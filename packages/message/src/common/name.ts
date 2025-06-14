import { Label as _Label, labelsParser } from './label';

export namespace Name {
  export namespace Label {
    export type Standard = _Label.Standard;
  }
}

/**
 * https://datatracker.ietf.org/doc/html/rfc1035#section-3.1
 */
export class Name {
  private constructor(public readonly labels: _Label.Standard[]) {}

  static of(name: string) {
    return new Name(name.split('.').map((label) => new _Label.Standard(label)));
  }

  static from(name: labelsParser.Parsed) {
    const flatten: string[] = [];
    for (const label of name.labels) {
      if (label.type === 0b00) {
        flatten.push(label.value);
        continue;
      }
      if (label.type === 0b11) {
        flatten.push(...label.value);
        continue;
      }
      throw new Error(`Invalid label type: ${(label as any).type}`);
    }
    return new Name(flatten.map((label) => new _Label.Standard(label)));
  }

  serialize(): Buffer {
    const buffers: Buffer[] = [];
    for (const label of this.labels) {
      buffers.push(label.serialize());
    }
    return Buffer.concat(buffers);
  }

  valueOf(): string {
    return this.labels.map((label) => label.valueOf()).join('.');
  }
}

export const nameParser = labelsParser;
nameParser.compile();
