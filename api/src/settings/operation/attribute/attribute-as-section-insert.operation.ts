import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../../content/model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeEntity } from '../../model/attribute.entity';
import { AttributeAsSectionEntity } from '../../model/attribute-as-section.entity';

export class AttributeAsSectionInsertOperation {

  created: AttributeAsSectionEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new AttributeAsSectionEntity();
  }

  /**
   *
   */
  private async checkBlock(id: string): Promise<BlockEntity> {
    const blockRepo = this.manager.getRepository<BlockEntity>(BlockEntity);

    return WrongDataException.assert(
      await blockRepo.findOne({where: {id}}),
      `Block with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(created: AttributeEntity, block: string): Promise<any> {
    this.created.block = await this.checkBlock(block);
    this.created.parent = created;

    await this.manager.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.message);
      });
  }

}