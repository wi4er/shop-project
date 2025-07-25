import { FlagEntity } from '../../model/flag/flag.entity';
import { EntityManager } from 'typeorm';
import { Flag4stringEntity } from '../../model/flag/flag4string.entity';
import { Flag2flagEntity } from '../../model/flag/flag2flag.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { FlagInput } from '../../input/flag/flag.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class FlagUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    return NoDataException.assert(
      await this.manager
        .getRepository(FlagEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true, lang: true},
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
    try {
      await this.manager.update(FlagEntity, {id}, {
        id: WrongDataException.assert(input.id, 'Flag id expected'),
        color: input.color,
        icon: input.icon,
        iconSvg: input.iconSvg,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkFlag(input.id);

    await new FlagValueOperation(this.manager, beforeItem).save(Flag2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, beforeItem).save(Flag4stringEntity, pack.string);

    return beforeItem.id;
  }

}