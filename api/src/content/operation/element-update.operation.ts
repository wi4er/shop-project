import { EntityManager } from 'typeorm';
import { PropertyValueUpdateOperation } from '../../common/operation/property-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { ElementEntity } from '../model/element.entity';
import { ElementInput } from '../input/element.input';
import { Element2stringEntity } from '../model/element2string.entity';
import { Element2flagEntity } from '../model/element2flag.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class ElementUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkBlock(id: number): Promise<BlockEntity> {
    const blockRepo = this.manager.getRepository<BlockEntity>(BlockEntity);

    const inst = await blockRepo.findOne({where: {id}});
    WrongDataException.assert(inst, 'Wrong block id!');

    return inst;
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkElement(id: number): Promise<ElementEntity> {
    const elementRepo = this.manager.getRepository(ElementEntity);

    const inst = await elementRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Element not found!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: number, input: ElementInput): Promise<number> {
    const beforeItem = await this.checkElement(id);

    beforeItem.block = await this.checkBlock(input.block);
    await beforeItem.save();

    await new PropertyValueUpdateOperation(this.manager, Element2stringEntity).save(beforeItem, input);
    await new FlagValueUpdateOperation(this.manager, Element2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}