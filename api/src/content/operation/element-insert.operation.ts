import { EntityManager } from 'typeorm';
import { PropertyValueInsertOperation } from '../../common/operation/property-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { ElementEntity } from '../model/element.entity';
import { Element2stringEntity } from '../model/element2string.entity';
import { Element2flagEntity } from '../model/element2flag.entity';
import { ElementInput } from '../input/element.input';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class ElementInsertOperation {

  created: ElementEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new ElementEntity();
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkBlock(id: number): Promise<BlockEntity> {
    const blockRepo = this.manager.getRepository<BlockEntity>(BlockEntity);

    const inst = await blockRepo.findOne({where: {id}});
    WrongDataException.assert(inst, 'Wrong block id!')

    return inst;
  }

  /**
   *
   * @param input
   */
  async save(input: ElementInput): Promise<number> {
    this.created.block = await this.checkBlock(input.block);

    await this.manager.save(this.created);

    await new PropertyValueInsertOperation(this.manager, Element2stringEntity).save(this.created, input);
    await new FlagValueInsertOperation(this.manager, Element2flagEntity).save(this.created, input);

    return this.created.id;
  }

}