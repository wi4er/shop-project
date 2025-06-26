import { EntityManager } from 'typeorm';
import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { AttributeInput } from '../../input/attribute/attribute.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { BlockEntity } from '../../../content/model/block/block.entity';
import { AttributeAsSectionEntity } from '../../model/attribute/attribute-as-section.entity';

export class AttributeAsSectionOperation {

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
    const repo = this.transaction.getRepository<AttributeAsSectionEntity>(AttributeAsSectionEntity);

    const inst = await repo.findOne({
      where: {parent: {id: item.id}},
    }) ?? new AttributeAsSectionEntity();

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