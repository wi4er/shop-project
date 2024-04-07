import { EntityManager } from 'typeorm';
import { Flag4stringEntity } from '../model/flag4string.entity';
import { Flag2flagEntity } from '../model/flag2flag.entity';
import { FlagEntity } from '../model/flag.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { FlagInput } from '../input/flag.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class FlagInsertOperation {

  created: FlagEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new FlagEntity();
  }

  async save(input: FlagInput): Promise<string> {
    this.created.id = input.id;

    try {
      await this.manager.insert(FlagEntity, this.created)
    } catch(err) {
      throw new WrongDataException(err.message)
    }

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Flag4stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, Flag2flagEntity).save(this.created, input);

    return this.created.id;
  }

}