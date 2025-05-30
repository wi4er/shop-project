import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeEntity } from '../../model/attribute.entity';
import { CollectionEntity } from '../../../storage/model/collection.entity';
import { AttributeAsFileEntity } from '../../model/attribute-as-file.entity';

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
    const colRepo = this.transaction.getRepository(CollectionEntity);

    return WrongDataException.assert(
      await colRepo.findOne({where: {id}}),
      `Collection with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(created: AttributeEntity, collection: string): Promise<any> {
    this.created.collection = await this.checkCollection(collection);
    this.created.parent = created;

    await this.transaction.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.message);
      });
  }

}