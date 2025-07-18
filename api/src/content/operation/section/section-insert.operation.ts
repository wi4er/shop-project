import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { SectionEntity } from '../../model/section/section.entity';
import { SectionInput } from '../../input/section/section.input';
import { Section4stringEntity } from '../../model/section/section4string.entity';
import { Section2flagEntity } from '../../model/section/section2flag.entity';
import { Section4pointEntity } from '../../model/section/section4point.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { Section2imageEntity } from '../../model/section/section2image.entity';
import { Section2permissionEntity } from '../../model/section/section2permission.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';
import { ImageValueOperation } from '../../../common/operation/image-value.operation';

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

    await new FlagValueOperation(this.manager, this.created).save(Section2flagEntity, input.flag);
    await new ImageValueOperation(this.manager, Section2imageEntity).save(this.created, input.image);
    await new PermissionValueOperation(this.manager, Section2permissionEntity).save(this.created, input.permission);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, this.created).save(Section4stringEntity, pack.string);
    await new PointValueOperation(this.manager, Section4pointEntity).save(this.created, pack.point);

    return this.created.id;
  }

}