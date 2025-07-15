import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { SectionEntity } from '../../model/section/section.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { SectionInput } from '../../input/section/section.input';
import { Section2flagEntity } from '../../model/section/section2flag.entity';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';

export class SectionPatchOperation {

  constructor(
    private manager: EntityManager,
  ) {
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
          },
        }),
      `Section with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: SectionInput): Promise<string> {
    try {
      await this.manager.update(SectionEntity, {id}, {});
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkSection(id);

    if (input.flag) await new FlagValueOperation(this.manager, beforeItem).save(Section2flagEntity, input.flag);

    return beforeItem.id;
  }

}