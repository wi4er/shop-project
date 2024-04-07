import { EntityManager } from 'typeorm';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { FileEntity } from '../model/file.entity';
import { FileInput } from '../input/File.input';
import { File4stringEntity } from '../model/file4string.entity';
import { File2flagEntity } from '../model/file2flag.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { CollectionEntity } from '../model/collection.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class FileInsertOperation {

  created: FileEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new FileEntity();
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkCollection(id: string): Promise<CollectionEntity> {
    const colRepo = this.manager.getRepository(CollectionEntity);

    const inst = await colRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Collection with id ${id} not found!`);
  }

  /**
   *
   * @param input
   */
  async save(input: FileInput): Promise<number> {
    this.created.id = input.id;
    this.created.collection = await this.checkCollection(input.collection);
    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, File4stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, File2flagEntity).save(this.created, input);

    return this.created.id;
  }

}