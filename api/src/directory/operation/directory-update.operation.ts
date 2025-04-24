import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../model/directory.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { Directory4stringEntity } from '../model/directory4string.entity';
import { Directory2flagEntity } from '../model/directory2flag.entity';
import { DirectoryInput } from '../input/directory.input';
import { filterAttributes } from '../../common/input/filter-attributes';

export class DirectoryUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    const dirRepo = this.manager.getRepository(DirectoryEntity);

    return NoDataException.assert(
      await dirRepo.findOne({
        where: {id},
        relations: {
          string: {attribute: true},
          flag: {flag: true},
        },
      }),
      `Directory with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: DirectoryInput): Promise<string> {
    const beforeItem = await this.checkDirectory(id);
    beforeItem.id = input.id;

    await beforeItem.save();

    await new FlagValueUpdateOperation(this.manager, Directory2flagEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Directory4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}