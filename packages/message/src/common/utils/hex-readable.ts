export class HexReadable {
  /**
   * 00 01 02 03  04 05 06 07
   */
  static fromBuffer(binary: Buffer): string {
    const bytes = Array.from(binary);

    const lines: string[] = [];
    for (const _16Bytes of splitEvery(bytes, 16)) {
      const hex = _16Bytes
        .slice(0, 4)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' ');

      const hex2 = _16Bytes
        .slice(4, 8)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' ');

      const hex3 = _16Bytes
        .slice(8, 12)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' ');

      const hex4 = _16Bytes
        .slice(12, 16)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(' ');

      lines.push(`${hex}  ${hex2}  ${hex3}  ${hex4}`.trim());
    }

    return lines.join('\n');
  }

  static toBuffer(hexReadable: string): Buffer {
    const cleared = hexReadable.replace(/\s/g, '');
    const bytes = splitEvery(cleared, 2).map((hex) => parseInt(hex, 16));
    return Buffer.from(bytes);
  }
}

function splitEvery<T extends any[] | string>(array: T, size: number): T[] {
  const result: any[] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
