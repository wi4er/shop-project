import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../model/directory.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { PropertyValueUpdateOperation } from '../../common/operation/property-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { Directory2stringEntity } from '../model/directory2string.entity';
import { Directory2flagEntity } from '../model/directory2flag.entity';
import { DirectoryInput } from '../input/directory.input';

export class DirectoryUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    const dirRepo = this.manager.getRepository(DirectoryEntity);

    const inst = await dirRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Directory not found!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: DirectoryInput): Promise<string> {
    const beforeItem = await this.checkDirectory(id);
    beforeItem.id = input.id;

    await beforeItem.save();

    await new PropertyValueUpdateOperation(this.manager, Directory2stringEntity).save(beforeItem, input);
    await new FlagValueUpdateOperation(this.manager, Directory2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}