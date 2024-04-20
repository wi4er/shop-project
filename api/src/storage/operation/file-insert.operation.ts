import { EntityManager } from 'typeorm';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { FileEntity } from '../model/file.entity';
import { FileInput } from '../input/File.input';
import { File4stringEntity } from '../model/file4string.entity';
import { File2flagEntity } from '../model/file2flag.entity';
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
    WrongDataException.assert(id, `Collection id expected`);
    const colRepo = this.manager.getRepository(CollectionEntity);
    const collection = await colRepo.findOne({where: {id}});

    return WrongDataException.assert(collection, `Collection with id ${id} not found!`);
  }

  /**
   *
   * @param input
   */
  async save(input: FileInput): Promise<number> {
    this.created.collection = await this.checkCollection(input.collection);
    this.created.original = input.original;
    this.created.encoding = input.encoding;
    this.created.mimetype = input.mimetype;

    try {
      await this.manager.insert(FileEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err);
    }

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, File4stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.manager, File2flagEntity).save(this.created, input);

    return this.created.id;
  }

}