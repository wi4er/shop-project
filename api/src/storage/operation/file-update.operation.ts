import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../common/input/filter-attributes';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { FileEntity } from '../model/file.entity';
import { FileInput } from '../input/File.input';
import { File4stringEntity } from '../model/file4string.entity';
import { File2flagEntity } from '../model/file2flag.entity';
import { CollectionEntity } from '../model/collection.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class FileUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkFile(id: number): Promise<FileEntity> {
    const flagRepo = this.manager.getRepository(FileEntity);

    return NoDataException.assert(
      await flagRepo.findOne({
        where: {id},
        relations: {
          string: {attribute: true},
          flag: {flag: true},
        },
      }),
      `File with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  private async checkCollection(id: string): Promise<CollectionEntity> {
    const colRepo = this.manager.getRepository(CollectionEntity);

    return WrongDataException.assert(
      await colRepo.findOne({where: {id}}),
      `Collection with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(id: number, input: FileInput): Promise<number> {
    const beforeItem = await this.checkFile(id);
    beforeItem.collection = await this.checkCollection(input.collection);

    await beforeItem.save();

    await new FlagValueUpdateOperation(this.manager, File2flagEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, File4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}