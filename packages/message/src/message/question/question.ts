import { Name } from '../../common/name';
import { DnsClass } from '../../common/types/class';
import { DnsType } from '../../common/types/type';
import { QuestionSerializer } from './question.serializer';

export class Question {
  constructor(
    public readonly name: string,
    public readonly type: DnsType,
    public readonly _class: DnsClass,
  ) {}

  serialize() {
    return Buffer.concat([
      Name.serialize(this.name),
      QuestionSerializer.type(this.type),
      QuestionSerializer.class(this._class),
    ]);
  }
}
