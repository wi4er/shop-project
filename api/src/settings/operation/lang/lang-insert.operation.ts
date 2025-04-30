import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { StringValueInsertOperation } from '../../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { LangEntity } from '../../model/lang.entity';
import { LangInput } from '../../input/lang.input';
import { Lang4stringEntity } from '../../model/lang4string.entity';
import { Lang2flagEntity } from '../../model/lang2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class LangInsertOperation {

  created: LangEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new LangEntity();
  }

  async save(input: LangInput): Promise<string> {
    this.created.id = input.id;

    try {
      await this.manager.insert(LangEntity, this.created);
    } catch(err) {
      throw new WrongDataException(err.message)
    }

    const [stringList, pointList] = filterAttributes(input.attribute);

    await new StringValueInsertOperation(this.manager, Lang4stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, Lang2flagEntity).save(this.created, input);

    return this.created.id;
  }

}