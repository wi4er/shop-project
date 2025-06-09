import { EntityManager } from 'typeorm';
import { AttributeEntity, AttributeType } from '../../model/attribute.entity';
import { AttributeInput } from '../../input/attribute.input';
import { DirectoryEntity } from '../../../registry/model/directory.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AttributeAsPointEntity } from '../../model/attribute-as-point.entity';

export class AttributeAsPointUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    return WrongDataException.assert(
      await this.transaction
        .getRepository(DirectoryEntity)
        .findOne({where: {id}}),
      `Directory with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(
    item: AttributeEntity,
    input: AttributeInput,
  ): Promise<void> {
    const repo = this.transaction.getRepository<AttributeAsPointEntity>(AttributeAsPointEntity);

    if (input.type !== AttributeType.POINT) {
      await this.transaction.delete(AttributeAsPointEntity, {parent: item})
        .catch(err => {
          throw new WrongDataException(err.message);
        });
    } else {
      const inst = await repo.findOne({
        where: {parent: {id: item.id}},
      }) ?? new AttributeAsPointEntity();

      inst.directory = await this.checkDirectory(
        WrongDataException.assert(input.directory, 'Directory field expected!')
      );
      inst.parent = item;

      await this.transaction.save(inst)
        .catch(err => {
          throw new WrongDataException(err.message);
        });
    }
  }

}