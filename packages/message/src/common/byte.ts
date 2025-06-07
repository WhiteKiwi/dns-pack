export class Byte {
  constructor(private value: number) {}

  /**
   * @param start 0-7 사이의 비트 위치
   * @param length 0-8 사이의 비트 수
   * @param value 0-255 사이의 값
   */
  write(start: number, length: number, value: number) {
    if (start < 0) {
      throw new Error(`Byte: start ${start} must be non-negative`);
    }
    if (8 < start + length) {
      throw new Error(`Byte: start ${start} + length ${length} exceeds byte size (8)`);
    }
    if (value < 0) {
      throw new Error(`Byte: Value ${value} must be non-negative`);
    }
    const mask = (1 << length) - 1;
    if (mask < value) {
      throw new Error(`Byte: Value ${value} exceeds max ${mask}`);
    }

    const shift = 7 - start - length + 1;
    this.value = (this.value & ~(mask << shift)) | ((value & mask) << shift);

    return this;
  }

  /**
   * @param start 시작 비트 위치 (0-7)
   * @param length 읽을 비트 수 (0-8)
   */
  read(start: number, length: number) {
    const end = start + length;
    if (start < 0 || start > 7 || end <= start || end > 8) {
      throw new Error('Invalid start/end positions');
    }

    // 지정된 범위의 비트들을 추출
    const mask = (1 << (end - start)) - 1;
    return (this.value >> (7 - end + 1)) & mask;
  }
}
