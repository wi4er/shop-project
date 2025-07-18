import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { SectionInput } from '../../input/section/section.input';
import { Section4stringEntity } from '../../model/section/section4string.entity';
import { Section2flagEntity } from '../../model/section/section2flag.entity';
import { SectionEntity } from '../../model/section/section.entity';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { Section2imageEntity } from '../../model/section/section2image.entity';
import { Section2permissionEntity } from '../../model/section/section2permission.entity';
import { Section4pointEntity } from '../../model/section/section4point.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';
import { PointValueOperation } from '../../../common/operation/attribute/point-value.operation';
import { PermissionValueOperation } from '../../../common/operation/permission-value.operation';
import { ImageValueOperation } from '../../../common/operation/image-value.operation';

export class SectionUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkBlock(id?: string): Promise<BlockEntity> {
    WrongDataException.assert(id, 'BlockEntity id expected!');

    return WrongDataException.assert(
      await this.manager
        .getRepository<BlockEntity>(BlockEntity)
        .findOne({where: {id}}),
      `Content block with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkSection(id: string): Promise<SectionEntity> {
    return NoDataException.assert(
      await this.manager
        .getRepository(SectionEntity)
        .findOne({
          where: {id},
          relations: {
            image: {image: true},
            string: {attribute: true},
            flag: {flag: true},
            point: {point: true, attribute: true},
            permission: {group: true},
          },
        }),
      `Section id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  private async checkParent(id: string): Promise<SectionEntity> {
    return WrongDataException.assert(
      await this.manager
        .getRepository(SectionEntity)
        .findOne({where: {id}}),
      `Section id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: SectionInput): Promise<string> {
    try {
      await this.manager.update(SectionEntity, {id}, {
        id: WrongDataException.assert(input.id, 'SectionEntity id expected'),
        block: await this.checkBlock(input.block),
        sort: input.sort,
        parent: input.parent ? await this.checkParent(input.parent) : null,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkSection(input.id);

    await new FlagValueOperation(this.manager, beforeItem).save(Section2flagEntity, input.flag);
    await new ImageValueOperation(this.manager, Section2imageEntity).save(beforeItem, input.image);
    await new PermissionValueOperation(this.manager, Section2permissionEntity).save(beforeItem, input.permission);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, beforeItem).save(Section4stringEntity, pack.string);
    await new PointValueOperation(this.manager, Section4pointEntity).save(beforeItem, pack.point);

    return beforeItem.id;
  }

}