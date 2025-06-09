import { EntityManager } from 'typeorm';
import { AttributeEntity, AttributeType } from '../../model/attribute.entity';
import { AttributeInput } from '../../input/attribute.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeAsElementEntity } from '../../model/attribute-as-element.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';

export class AttributeAsElementUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkBlock(id: string): Promise<BlockEntity> {
    return WrongDataException.assert(
      await this.transaction
        .getRepository<BlockEntity>(BlockEntity)
        .findOne({where: {id}}),
      `Block with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(
    item: AttributeEntity,
    input: AttributeInput,
  ) {
    const repo = this.transaction.getRepository<AttributeAsElementEntity>(AttributeAsElementEntity);

    if (input.type !== AttributeType.ELEMENT) {
      await this.transaction.delete(AttributeAsElementEntity, {parent: item})
        .catch(err => {
          throw new WrongDataException(err.message);
        });
    } else {
      const inst = await repo.findOne({
        where: {parent: {id: item.id}},
      }) ?? new AttributeAsElementEntity();

      inst.block = await this.checkBlock(
        WrongDataException.assert(input.block, 'Block id expected!'),
      );
      inst.parent = item;

      await this.transaction.save(inst)
        .catch(err => {
          throw new WrongDataException(err.message);
        });
    }
  }

}