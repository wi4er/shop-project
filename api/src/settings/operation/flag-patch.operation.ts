import { EntityManager } from 'typeorm';
import { FlagEntity } from '../model/flag.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { FlagInput } from '../input/flag.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { Flag2flagEntity } from '../model/flag2flag.entity';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { Flag4stringEntity } from '../model/flag4string.entity';

export class FlagPatchOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    const flagRepo = this.manager.getRepository(FlagEntity);

    return NoDataException.assert(
      await flagRepo.findOne({
        where: {id},
        relations: {
          string: {property: true, lang: true},
          flag: {flag: true},
        },
      }),
      `Flag with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: FlagInput): Promise<string> {
    const beforeItem = await this.checkFlag(id);

    if (input.flag) await new FlagValueUpdateOperation(this.manager, Flag2flagEntity).save(beforeItem, input);

    if (input.property) {
      const [stringList] = filterProperties(input.property);
      await new StringValueUpdateOperation(this.manager, Flag4stringEntity).save(beforeItem, stringList);
    }

    return beforeItem.id;
  }

}