import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../model/directory/directory.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { Directory4stringEntity } from '../../model/directory/directory4string.entity';
import { Directory2flagEntity } from '../../model/directory/directory2flag.entity';
import { DirectoryInput } from '../../input/directory/directory.input';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { Directory2permissionEntity } from '../../model/directory/directory2permission.entity';
import { DirectoryLogInsertOperation } from '../log/directory-log.insert.operation';
import { Directory4pointEntity } from '../../model/directory/directory4point.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';

export class DirectoryUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    return NoDataException.assert(
      await this.transaction
        .getRepository(DirectoryEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
            permission: {group: true},
          },
        }),
      `Directory with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(
    id: string,
    input: DirectoryInput,
  ): Promise<string> {
    try {
      await this.transaction.update(DirectoryEntity, {id}, {
        id: input.id,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkDirectory(input.id);

    if (id !== WrongDataException.assert(input.id, 'Directory id expected')) {
      await new DirectoryLogInsertOperation(this.transaction).save(beforeItem, {
        from: id,
        to: input.id,
      });
    }
    await new FlagValueOperation(this.transaction, Directory2flagEntity).save(beforeItem, input.flag);
    await new PermissionValueOperation(this.transaction, Directory2permissionEntity).save(beforeItem, input.permission);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, Directory4stringEntity).save(beforeItem, pack.string);
    await new PointValueOperation(this.transaction, Directory4pointEntity).save(beforeItem, pack.point);

    return beforeItem.id;
  }

}