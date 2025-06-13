import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { FileEntity } from '../../model/file.entity';
import { FileInput } from '../../input/File.input';
import { File4stringEntity } from '../../model/file4string.entity';
import { File2flagEntity } from '../../model/file2flag.entity';
import { CollectionEntity } from '../../model/collection.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/string-value.operation';

export class FileInsertOperation {

  created: FileEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new FileEntity();
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
  async save(input: FileInput): Promise<number> {
    this.created.collection = await this.checkCollection(
      WrongDataException.assert(input.collection, `Collection id expected`)
    );
    this.created.original = input.original;
    this.created.mimetype = input.mimetype;
    this.created.path = input.path;

    try {
      await this.manager.insert(FileEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err);
    }

    await new FlagValueOperation(this.manager, File2flagEntity).save(this.created, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, File4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}