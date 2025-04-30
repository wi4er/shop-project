import { EntityManager } from 'typeorm';
import { AttributeEntity, AttributeType } from '../../model/attribute.entity';
import { AttributeInput } from '../../input/attribute.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeAsFileEntity } from '../../model/attribute-as-file.entity';
import { CollectionEntity } from '../../../storage/model/collection.entity';

export class AttributeAsFileUpadteOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkCollection(id: string): Promise<CollectionEntity> {
    WrongDataException.assert(id, 'Collection id expected!');

    return WrongDataException.assert(
      await this.transaction
        .getRepository(CollectionEntity)
        .findOne({where: {id}}),
      `Collection with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(
    item: AttributeEntity,
    input: AttributeInput,
  ) {
    const repo = this.transaction.getRepository<AttributeAsFileEntity>(AttributeAsFileEntity);

    if (input.type !== AttributeType.FILE) {
      await this.transaction.delete(AttributeAsFileEntity, {parent: item})
        .catch(err => {
          throw new WrongDataException(err.message);
        });
    } else {
      const inst = await repo.findOne({where: {parent: item}}) ?? new AttributeAsFileEntity();

      inst.collection = await this.checkCollection(input.collection);
      inst.parent = item;

      await this.transaction.save(inst)
        .catch(err => {
          throw new WrongDataException(err.message);
        });
    }
  }

}