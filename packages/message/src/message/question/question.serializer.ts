import { Name } from '../../common/name';
import { DnsClass } from '../../common/types/class';
import { DnsType } from '../../common/types/type';

export class QuestionSerializer {
  static name(name: string) {
    return Name.serialize(name);
  }

  static type(type: DnsType) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(type, 0);
    return buffer;
  }

  static class(_class: DnsClass) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(_class, 0);
    return buffer;
  }
}
