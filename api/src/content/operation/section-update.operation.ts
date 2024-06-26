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
import { ImageUpdateOperation } from '../../common/operation/image-update.operation';
import { Section2imageEntity } from '../model/section2image.entity';
import { ElementEntity } from '../model/element.entity';

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

    return WrongDataException.assert(
      await blockRepo.findOne({where: {id}}),
      `Content block with id ${id} not found!`
    );
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkSection(id: string): Promise<SectionEntity> {
    const sectionRepo = this.manager.getRepository(SectionEntity);

    return NoDataException.assert(
      await sectionRepo.findOne({
        where: {id},
        relations: {
          image: {image: true},
          string: {property: true},
          flag: {flag: true},
        },
      }),
      `Section id ${id} not found!`
    );
  }

  private async checkParent(id: string): Promise<SectionEntity> {
    const sectionRepo = this.manager.getRepository(SectionEntity);

    return WrongDataException.assert(
      await sectionRepo.findOne({where: {id}}),
      `Section id ${id} not found!`
    );
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: SectionInput): Promise<string> {
    try {
      await this.manager.update(SectionEntity, {id}, {
        id:  WrongDataException.assert(input.id, 'Section id expected'),
        block: await this.checkBlock(input.block),
        sort: input.sort,
        parent: input.parent ? await this.checkParent(input.parent) : null,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkSection(input.id);
    const [stringList, pointList] = filterProperties(input.property);
    await new FlagValueUpdateOperation(this.manager, Section2flagEntity).save(beforeItem, input);
    await new ImageUpdateOperation(this.manager, Section2imageEntity).save(beforeItem, input.image);

    await new StringValueUpdateOperation(this.manager, Section4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}