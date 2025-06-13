import { FlagEntity } from '../../model/flag.entity';
import { EntityManager } from 'typeorm';
import { Flag4stringEntity } from '../../model/flag4string.entity';
import { Flag2flagEntity } from '../../model/flag2flag.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { FlagInput } from '../../input/flag.input';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/string-value.operation';

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
        id: WrongDataException.assert(input.id, 'FlagEntity id expected'),
        color: input.color,
        icon: input.icon,
        iconSvg: input.iconSvg,
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkFlag(input.id);

    await new FlagValueOperation(this.manager, Flag2flagEntity).save(beforeItem, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.manager, Flag4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}