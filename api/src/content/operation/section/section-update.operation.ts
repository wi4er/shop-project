import { EntityManager } from 'typeorm';
import { BlockEntity } from '../../model/block.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { StringValueUpdateOperation } from '../../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { SectionInput } from '../../input/section.input';
import { Section4stringEntity } from '../../model/section4string.entity';
import { Section2flagEntity } from '../../model/section2flag.entity';
import { SectionEntity } from '../../model/section.entity';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { ImageUpdateOperation } from '../../../common/operation/image-update.operation';
import { Section2imageEntity } from '../../model/section2image.entity';
import { PermissionValueUpdateOperation } from '../../../common/operation/permission-value-update.operation';
import { Section2permissionEntity } from '../../model/section2permission.entity';
import { PointValueUpdateOperation } from '../../../common/operation/point-value-update.operation';
import { Section4pointEntity } from '../../model/section4point.entity';

export class SectionUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkBlock(id?: number): Promise<BlockEntity> {
    WrongDataException.assert(id, 'Block id expected!');

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
    const sectionRepo = this.manager.getRepository(SectionEntity);

    return NoDataException.assert(
      await sectionRepo.findOne({
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
        id: WrongDataException.assert(input.id, 'Section id expected'),
        block: await this.checkBlock(input.block),
        sort: input.sort,
        parent: input.parent ? await this.checkParent(input.parent) : null,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkSection(input.id);

    await new FlagValueUpdateOperation(this.manager, Section2flagEntity).save(beforeItem, input);
    await new ImageUpdateOperation(this.manager, Section2imageEntity).save(beforeItem, input.image);
    await new PermissionValueUpdateOperation(this.manager, Section2permissionEntity).save(beforeItem, input);

    const [stringList, pointList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Section4stringEntity).save(beforeItem, stringList);
    await new PointValueUpdateOperation(this.manager, Section4pointEntity).save(beforeItem, pointList);

    return beforeItem.id;
  }

}