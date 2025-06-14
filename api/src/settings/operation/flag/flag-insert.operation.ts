import { EntityManager } from 'typeorm';
import { Flag4stringEntity } from '../../model/flag/flag4string.entity';
import { Flag2flagEntity } from '../../model/flag/flag2flag.entity';
import { FlagEntity } from '../../model/flag/flag.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { FlagInput } from '../../input/flag/flag.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class FlagInsertOperation {

  created: FlagEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new FlagEntity();
  }

  /**
   *
   */
  async save(input: FlagInput): Promise<string> {
    this.created.id = input.id;
    this.created.color = input.color;
    this.created.icon = input.icon;
    this.created.iconSvg = input.iconSvg;

    try {
      await this.manager.insert(FlagEntity, this.created)
    } catch(err) {
      throw new WrongDataException(err.message)
    }

    await new FlagValueOperation(this.manager, Flag2flagEntity).save(this.created, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Flag4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}