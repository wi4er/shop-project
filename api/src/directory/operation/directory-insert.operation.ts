import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../model/directory.entity';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { DirectoryInput } from '../input/directory.input';
import { Directory2stringEntity } from '../model/directory2string.entity';
import { Directory2flagEntity } from '../model/directory2flag.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { PointValueInsertOperation } from '../../common/operation/point-value-insert.operation';
import { Directory2pointEntity } from '../model/directory2point.entity';

export class DirectoryInsertOperation {

  created: DirectoryEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new DirectoryEntity();
  }

  /**
   *
   * @param input
   */
  async save(input: DirectoryInput): Promise<string> {
    this.created.id = input.id;

    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Directory2stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Directory2pointEntity).save(this.created, pointList);
    await new FlagValueInsertOperation(this.manager, Directory2flagEntity).save(this.created, input);

    return this.created.id;
  }

}