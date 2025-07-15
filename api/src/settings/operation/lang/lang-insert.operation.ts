import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { LangEntity } from '../../model/lang/lang.entity';
import { LangInput } from '../../input/lang/lang.input';
import { Lang4stringEntity } from '../../model/lang/lang4string.entity';
import { Lang2flagEntity } from '../../model/lang/lang2flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class LangInsertOperation {

  created: LangEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new LangEntity();
  }

  /**
   *
   */
  async save(input: LangInput): Promise<string> {
    this.created.id = input.id;

    try {
      await this.manager.insert(LangEntity, this.created);
    } catch(err) {
      throw new WrongDataException(err.message)
    }

    await new FlagValueOperation(this.manager, this.created).save(Lang2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Lang4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}