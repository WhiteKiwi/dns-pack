import { Parser } from 'binary-parser';

export class TypedBinaryParser<T> extends Parser {
  override parse(buffer: Buffer): T {
    return super.parse(buffer);
  }
}
