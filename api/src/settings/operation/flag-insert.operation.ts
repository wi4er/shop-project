import { EntityManager } from 'typeorm';
import { Flag2stringEntity } from '../model/flag2string.entity';
import { Flag2flagEntity } from '../model/flag2flag.entity';
import { FlagEntity } from '../model/flag.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { FlagInput } from '../input/flag.input';

export class FlagInsertOperation {

  created: FlagEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new FlagEntity();
  }

  async save(input: FlagInput): Promise<string> {
    this.created.id = input.id;
    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Flag2stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, Flag2flagEntity).save(this.created, input);

    return this.created.id;
  }

}