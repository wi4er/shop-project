import { EntityManager } from 'typeorm';
import { BlockEntity } from '../model/block.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { SectionEntity } from '../model/section.entity';
import { SectionInput } from '../input/section.input';
import { Section4stringEntity } from '../model/section4string.entity';
import { Section2flagEntity } from '../model/section2flag.entity';
import { PointValueInsertOperation } from '../../common/operation/point-value-insert.operation';
import { Section4pointEntity } from '../model/section4point.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { ImageInsertOperation } from '../../common/operation/image-insert.operation';
import { Section2imageEntity } from '../model/section2image.entity';

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

    return WrongDataException.assert(
      await blockRepo.findOne({where: {id}}),
      `Block with id ${id} not found!`
    );
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkSection(id: number): Promise<SectionEntity> {
    const sectionRepo = this.manager.getRepository<SectionEntity>(SectionEntity);

    return WrongDataException.assert(
      await sectionRepo.findOne({where: {id}}),
      `Section with id ${id} not found!`
    );
  }

  /**
   *
   * @param input
   */
  async save(input: SectionInput): Promise<number> {
    this.created.block = await this.checkBlock(input.block);
    if (input.parent) this.created.parent = await this.checkSection(input.parent);

    await this.manager.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new ImageInsertOperation(this.manager, Section2imageEntity).save(this.created, input.image);
    await new FlagValueInsertOperation(this.manager, Section2flagEntity).save(this.created, input);

    await new StringValueInsertOperation(this.manager, Section4stringEntity).save(this.created, stringList);
    await new PointValueInsertOperation(this.manager, Section4pointEntity).save(this.created, pointList);

    return this.created.id;
  }

}