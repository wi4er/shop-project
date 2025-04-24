import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../model/directory.entity';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { DirectoryInput } from '../input/directory.input';
import { Directory4stringEntity } from '../model/directory4string.entity';
import { Directory2flagEntity } from '../model/directory2flag.entity';
import { filterAttributes } from '../../common/input/filter-attributes';
import { PointValueInsertOperation } from '../../common/operation/point-value-insert.operation';
import { Directory4pointEntity } from '../model/directory4point.entity';

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

    await new FlagValueInsertOperation(this.manager, Directory2flagEntity).save(this.created, input);

    const [stringList, pointList] = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, Directory4stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Directory4pointEntity).save(this.created, pointList);

    return this.created.id;
  }

}