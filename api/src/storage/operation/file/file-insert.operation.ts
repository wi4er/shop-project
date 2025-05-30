import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { StringValueInsertOperation } from '../../../common/operation/string/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag/flag-value-insert.operation';
import { FileEntity } from '../../model/file.entity';
import { FileInput } from '../../input/File.input';
import { File4stringEntity } from '../../model/file4string.entity';
import { File2flagEntity } from '../../model/file2flag.entity';
import { CollectionEntity } from '../../model/collection.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

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
    WrongDataException.assert(id, `Collection id expected`);

    return WrongDataException.assert(
      await this.manager
        .getRepository(CollectionEntity)
        .findOne({where: {id}}),
      `Collection with id ${id} not found!`,
    );
  }

  /**
   *
   */
  async save(input: FileInput): Promise<number> {
    this.created.collection = await this.checkCollection(input.collection);
    this.created.original = input.original;
    this.created.mimetype = input.mimetype;
    this.created.path = input.path;

    try {
      await this.manager.insert(FileEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err);
    }

    await new FlagValueInsertOperation(this.manager, File2flagEntity).save(this.created, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, File4stringEntity).save(this.created, pack.string);

    return this.created.id;
  }

}