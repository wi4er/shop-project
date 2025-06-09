import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeEntity } from '../../model/attribute.entity';
import { AttributeAsElementEntity } from '../../model/attribute-as-element.entity';
import { BlockEntity } from '../../../content/model/block/block.entity';

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
    created: AttributeEntity,
    block: string,
  ): Promise<any> {
    this.created.block = await this.checkBlock(
      WrongDataException.assert(block, 'BlockEntity id expected!')
    );
    this.created.parent = created;

    await this.transaction.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.message);
      });
  }

}