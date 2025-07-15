import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { FileEntity } from '../../model/file/file.entity';
import { FileInput } from '../../input/file/file.input';
import { File4stringEntity } from '../../model/file/file4string.entity';
import { File2flagEntity } from '../../model/file/file2flag.entity';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class FileUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkFile(id: number): Promise<FileEntity> {
    return NoDataException.assert(
      await this.manager
        .getRepository(FileEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
          },
        }),
      `File with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkCollection(id: string): Promise<CollectionEntity> {
    return WrongDataException.assert(
      await this.manager
        .getRepository(CollectionEntity)
        .findOne({where: {id}}),
      `Collection with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: number, input: FileInput): Promise<number> {
    const beforeItem = await this.checkFile(id);
    beforeItem.collection = await this.checkCollection(input.collection);

    await beforeItem.save();

    await new FlagValueOperation(this.manager, beforeItem).save(File2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, File4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}