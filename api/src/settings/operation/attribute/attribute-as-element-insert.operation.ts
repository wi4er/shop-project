import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeEntity } from '../../model/attribute.entity';
import { AttributeAsElementEntity } from '../../model/attribute-as-element.entity';
import { BlockEntity } from '../../../content/model/block.entity';

export class AttributeAsElementInsertOperation {

  created: AttributeAsElementEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new AttributeAsElementEntity();
  }

  /**
   *
   */
  private async checkBlock(id: number): Promise<BlockEntity> {
    const blockRepo = this.transaction.getRepository<BlockEntity>(BlockEntity);

    return WrongDataException.assert(
      await blockRepo.findOne({where: {id}}),
      `Block with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(created: AttributeEntity, block: number): Promise<any> {
    this.created.block = await this.checkBlock(block);
    this.created.parent = created;

    await this.transaction.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.message);
      });
  }

}