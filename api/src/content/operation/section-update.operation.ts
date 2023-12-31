import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { SectionInput } from '../input/section.input';
import { Section4stringEntity } from '../model/section4string.entity';
import { Section2flagEntity } from '../model/section2flag.entity';
import { SectionEntity } from '../model/section.entity';
import { filterProperties } from '../../common/input/filter-properties';

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
  private async checkBlock(id?: number): Promise<BlockEntity> {
    WrongDataException.assert(id, 'Block id expected!');

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

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Section4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Section2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}