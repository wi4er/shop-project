import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { PropertyInsertOperation } from '../../common/operation/property-insert.operation';
import { FlagInsertOperation } from '../../common/operation/flag-insert.operation';
import { SectionEntity } from '../model/section.entity';
import { SectionInput } from '../input/section.input';
import { Section2stringEntity } from '../model/section2string.entity';
import { Section2flagEntity } from '../model/section2flag.entity';
import { ElementEntity } from '../model/element.entity';
import { ElementInput } from '../input/element.input';
import { Element2stringEntity } from '../model/element2string.entity';
import { Element2flagEntity } from '../model/element2flag.entity';

export class SectionInsertOperation {

  created: SectionEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new SectionEntity();
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
   * @param id
   * @private
   */
  private async checkParent(id: number): Promise<SectionEntity> {
    const sectionRepo = this.manager.getRepository<SectionEntity>(SectionEntity);

    const inst = await sectionRepo.findOne({where: {id}});
    WrongDataException.assert(inst, 'Wrong parent id!')

    return inst;
  }

  /**
   *
   * @param input
   */
  async save(input: SectionInput): Promise<number> {
    this.created.block = await this.checkBlock(input.block);
    if (input.parent) this.created.parent = await this.checkParent(input.parent);

    await this.manager.save(this.created);

    await new PropertyInsertOperation(this.manager, Section2stringEntity).save(this.created, input);
    await new FlagInsertOperation(this.manager, Section2flagEntity).save(this.created, input);

    return this.created.id;
  }

}