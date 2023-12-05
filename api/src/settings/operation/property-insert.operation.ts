import { EntityManager } from 'typeorm';
import { FlagInput } from '../input/flag.input';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { PropertyEntity } from '../model/property.entity';
import { Property2stringEntity } from '../model/property2string.entity';
import { Property2flagEntity } from '../model/property2flag.entity';

export class PropertyInsertOperation {

  created: PropertyEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new PropertyEntity();
  }

  async save(input: FlagInput): Promise<string> {
    this.created.id = input.id;
    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Property2stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, Property2flagEntity).save(this.created, input);

    return this.created.id;
  }

}