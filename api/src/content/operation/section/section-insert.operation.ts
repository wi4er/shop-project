import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { StringValueInsertOperation } from '../../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { SectionEntity } from '../../model/section/section.entity';
import { SectionInput } from '../../input/section.input';
import { Section4stringEntity } from '../../model/section/section4string.entity';
import { Section2flagEntity } from '../../model/section/section2flag.entity';
import { PointValueInsertOperation } from '../../../common/operation/point-value-insert.operation';
import { Section4pointEntity } from '../../model/section/section4point.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { ImageInsertOperation } from '../../../common/operation/image-insert.operation';
import { Section2imageEntity } from '../../model/section/section2image.entity';
import { PermissionValueInsertOperation } from '../../../common/operation/permission-value-insert.operation';
import { Section2permissionEntity } from '../../model/section/section2permission.entity';

export class SectionInsertOperation {

  created: SectionEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new SectionEntity();
  }

  /**
   *
   */
  private async checkBlock(id: string): Promise<BlockEntity> {
    return WrongDataException.assert(
      await this.manager
        .getRepository<BlockEntity>(BlockEntity)
        .findOne({where: {id}}),
      `Block with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkSection(id: string): Promise<SectionEntity> {
    return WrongDataException.assert(
      await this.manager
        .getRepository<SectionEntity>(SectionEntity)
        .findOne({where: {id}}),
      `Section with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(input: SectionInput): Promise<string> {
    this.created.id = input.id;
    this.created.block = await this.checkBlock(input.block);
    if (input.sort) this.created.sort = input.sort;
    if (input.parent) this.created.parent = await this.checkSection(input.parent);

    try {
      await this.manager.insert(SectionEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    await new FlagValueInsertOperation(this.manager, Section2flagEntity).save(this.created, input);
    await new ImageInsertOperation(this.manager, Section2imageEntity).save(this.created, input.image);
    await new PermissionValueInsertOperation(this.manager, Section2permissionEntity).save(this.created, input);

    const pack = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.manager, Section4stringEntity).save(this.created, pack.string);
    await new PointValueInsertOperation(this.manager, Section4pointEntity).save(this.created, pack.point);

    return this.created.id;
  }

}