import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { SectionEntity } from '../../model/section.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { SectionInput } from '../../input/section.input';
import { FlagValueUpdateOperation } from '../../../common/operation/flag-value-update.operation';
import { Section2flagEntity } from '../../model/section2flag.entity';

export class SectionPatchOperation {

  constructor(
    private manager: EntityManager,
  ) {
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
        },
      }),
      `Section id >> ${id} << not found!`,
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

    if (input.flag) await new FlagValueUpdateOperation(this.manager, Section2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}