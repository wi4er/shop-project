import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { AttributeInput } from '../../input/attribute/attribute.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeAsFileEntity } from '../../model/attribute/attribute-as-file.entity';
import { CollectionEntity } from '../../../storage/model/collection/collection.entity';

export class AttributeAsFileOperation {

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
      `Collection with id >> ${id} << not found!`,
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

    const inst = await repo.findOne(
      {where: {parent: {id: item.id}}}
    ) ?? new AttributeAsFileEntity();

    inst.collection = await this.checkCollection(input.collection);
    inst.parent = item;

    await this.transaction.save(inst)
      .catch(err => {
        throw new WrongDataException(err.message);
      });
  }

}