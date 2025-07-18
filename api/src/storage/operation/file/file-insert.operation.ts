import { EntityManager } from 'typeorm';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { FileEntity } from '../../model/file/file.entity';
import { FileInput } from '../../input/file/file.input';
import { File4stringEntity } from '../../model/file/file4string.entity';
import { File2flagEntity } from '../../model/file/file2flag.entity';
import { CollectionEntity } from '../../model/collection/collection.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class FileInsertOperation {

  created: FileEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new FileEntity();
  }

  /**
   *
   */
  private async checkCollection(id: string): Promise<CollectionEntity> {
    return WrongDataException.assert(
      await this.transaction
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
      await this.transaction.insert(FileEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err);
    }

    await new FlagValueOperation(this.transaction, this.created).save(File2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.transaction, this.created).save(File4stringEntity, pack.string);

    return this.created.id;
  }

}