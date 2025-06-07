export class Byte {
  private value: number = 0;

  /**
   * @param value 0-255 사이의 값
   * @param offset 0-7 사이의 비트 위치
   */
  write(value: number, offset: number) {
    if (value > 0xff) {
      throw new Error('Value exceeds byte size');
    }
    if (offset < 0 || offset > 7) {
      throw new Error('Offset must be between 0 and 7');
    }

    // 해당 위치의 비트들을 클리어하고 새 값 설정
    const shiftedPosition = 7 - offset; // MSB가 왼쪽에 오도록
    this.value &= ~(0xff << shiftedPosition); // 해당 위치 비트들 클리어
    this.value |= value << shiftedPosition; // 새 값 설정

    return this;
  }

  /**
   * @param start 시작 비트 위치 (0-7)
   * @param range 읽을 비트 수 (0-8)
   */
  read(start: number, range: number) {
    const end = start + range;
    if (start < 0 || start > 7 || end <= start || end > 8) {
      throw new Error('Invalid start/end positions');
    }

    // 지정된 범위의 비트들을 추출
    const mask = (1 << (end - start)) - 1;
    return (this.value >> (7 - end + 1)) & mask;
  }
}
