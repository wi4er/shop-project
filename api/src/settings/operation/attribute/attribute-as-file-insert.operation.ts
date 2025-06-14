import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';
import { AttributeAsFileEntity } from '../../model/attribute/attribute-as-file.entity';

export class AttributeAsFileInsertOperation {

  created: AttributeAsFileEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new AttributeAsFileEntity();
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
  async save(created: AttributeEntity, collection: string): Promise<any> {
    this.created.collection = await this.checkCollection(
      WrongDataException.assert(collection, 'Collection id expected!'),
    );
    this.created.parent = created;

    await this.transaction.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.message);
      });
  }

}