import { EntityManager } from 'typeorm';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterProperties } from '../../common/input/filter-properties';
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
   * @param id
   * @private
   */
  private async checkFile(id: number): Promise<FileEntity> {
    const flagRepo = this.manager.getRepository(FileEntity);

    const inst = await flagRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, `File with id ${id} not found!`);

    return inst;
  }

  private async checkCollection(id: string): Promise<CollectionEntity> {
    const colRepo = this.manager.getRepository(CollectionEntity);

    const inst = await colRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Collection with id ${id} not found!`);
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: number, input: FileInput): Promise<number> {
    const beforeItem = await this.checkFile(id);
    beforeItem.collection = await this.checkCollection(input.collection);

    await beforeItem.save();

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, File4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, File2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}