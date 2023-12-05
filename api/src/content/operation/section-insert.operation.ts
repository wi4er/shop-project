import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { SectionEntity } from '../model/section.entity';
import { SectionInput } from '../input/section.input';
import { Section2stringEntity } from '../model/section2string.entity';
import { Section2flagEntity } from '../model/section2flag.entity';
import { PointValueInsertOperation } from '../../common/operation/point-value-insert.operation';
import { Section2pointEntity } from '../model/section2point.entity';
import { filterProperties } from '../../common/input/filter-properties';

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
    WrongDataException.assert(inst, 'Wrong block id!');

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
   * @param input
   */
  async save(input: SectionInput): Promise<number> {
    this.created.block = await this.checkBlock(input.block);
    if (input.parent) this.created.parent = await this.checkParent(input.parent);

    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.manager, Section2stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Section2pointEntity).save(this.created, pointList);
    await new FlagValueInsertOperation(this.manager, Section2flagEntity).save(this.created, input);

    return this.created.id;
  }

}