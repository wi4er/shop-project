import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory.entity';
import { StringValueInsertOperation } from '../../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { DirectoryInput } from '../../input/directory.input';
import { Directory4stringEntity } from '../../model/directory4string.entity';
import { Directory2flagEntity } from '../../model/directory2flag.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { PointValueInsertOperation } from '../../../common/operation/point-value-insert.operation';
import { Directory4pointEntity } from '../../model/directory4point.entity';
import { PermissionValueInsertOperation } from '../../../common/operation/permission-value-insert.operation';
import { Directory2permissionEntity } from '../../model/directory2permission.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class DirectoryInsertOperation {

  created: DirectoryEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new DirectoryEntity();
  }

  /**
   *
   */
  async save(input: DirectoryInput): Promise<string> {
    this.created.id = WrongDataException.assert(input.id, 'Directory id expected');

    try {
      await this.transaction.insert(DirectoryEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.detail);
    }

    await this.transaction.save(this.created);

    await new FlagValueInsertOperation(this.transaction, Directory2flagEntity).save(this.created, input);
    await new PermissionValueInsertOperation(this.transaction, Directory2permissionEntity).save(this.created, input);

    const [stringList, pointList] = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.transaction, Directory4stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.transaction, Directory4pointEntity).save(this.created, pointList);

    return this.created.id;
  }

}