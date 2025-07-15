import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { DirectoryInput } from '../../input/directory/directory.input';
import { Directory4stringEntity } from '../../model/directory/directory4string.entity';
import { Directory2flagEntity } from '../../model/directory/directory2flag.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { Directory4pointEntity } from '../../model/directory/directory4point.entity';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';

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
    this.created.id =  WrongDataException.assert(input.id, 'Directory id expected');

    try {
      await this.transaction.insert(DirectoryEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.detail);
    }

    await this.transaction.save(this.created);

    await new FlagValueOperation(this.transaction, this.created).save(Directory2flagEntity, input.flag);
    await new PermissionValueOperation(this.transaction, Directory2permissionEntity).save(this.created, input.permission);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Directory4stringEntity).save(this.created, pack.string);
    await new PointValueOperation(this.transaction, Directory4pointEntity).save(this.created, pack.point);

    return this.created.id;
  }

}