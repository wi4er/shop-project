import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { PropertyUpdateOperation } from '../../common/operation/property-update.operation';
import { FlagUpdateOperation } from '../../common/operation/flag-update.operation';
import { SectionInput } from '../input/section.input';
import { Section2stringEntity } from '../model/section2string.entity';
import { Section2flagEntity } from '../model/section2flag.entity';
import { SectionEntity } from '../model/section.entity';

export class SectionUpdateOperation {

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
  private async checkSection(id: number): Promise<SectionEntity> {
    const sectionRepo = this.manager.getRepository(SectionEntity);

    const inst = await sectionRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, 'Section not found!');

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
    WrongDataException.assert(inst, 'Wrong parent id!');

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: number, input: SectionInput): Promise<number> {
    const beforeItem = await this.checkSection(id);

    beforeItem.block = await this.checkBlock(input.block);
    if (input.parent) {
      beforeItem.parent = await this.checkParent(input.parent);
    } else {
      beforeItem.parent = null;
    }
    await beforeItem.save();

    await new PropertyUpdateOperation(this.manager, Section2stringEntity).save(beforeItem, input);
    await new FlagUpdateOperation(this.manager, Section2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}