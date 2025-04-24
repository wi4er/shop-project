import { FlagEntity } from '../model/flag.entity';
import { EntityManager } from 'typeorm';
import { Flag4stringEntity } from '../model/flag4string.entity';
import { Flag2flagEntity } from '../model/flag2flag.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../common/input/filter-attributes';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { FlagInput } from '../input/flag.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class FlagUpdateOperation {

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
          string: {attribute: true, lang: true},
          flag: {flag: true},
        },
      }),
      `Flag with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(id: string, input: FlagInput): Promise<string> {
    try {
      await this.manager.update(FlagEntity, {id}, {
        id:  WrongDataException.assert(input.id, 'Flag id expected'),
        color: input.color,
        icon: input.icon,
        iconSvg: input.iconSvg,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkFlag(input.id);

    await new FlagValueUpdateOperation(this.manager, Flag2flagEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.manager, Flag4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}