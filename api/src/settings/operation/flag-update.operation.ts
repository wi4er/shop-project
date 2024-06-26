import { FlagEntity } from '../model/flag.entity';
import { EntityManager } from 'typeorm';
import { Flag4stringEntity } from '../model/flag4string.entity';
import { Flag2flagEntity } from '../model/flag2flag.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';
import { filterProperties } from '../../common/input/filter-properties';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { FlagInput } from '../input/flag.input';
import { PropertyEntity } from '../model/property.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class FlagUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    const flagRepo = this.manager.getRepository(FlagEntity);

    const inst = await flagRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });
    NoDataException.assert(inst, `Flag with id ${id} not found!`);

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: FlagInput): Promise<string> {
    try {
      await this.manager.update(FlagEntity, {id}, {
        id:  WrongDataException.assert(input.id, 'Flag id expected'),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    const beforeItem = await this.checkFlag(input.id);

    const [stringList, pointList] = filterProperties(input.property);
    await new StringValueUpdateOperation(this.manager, Flag4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.manager, Flag2flagEntity).save(beforeItem, input);

    return beforeItem.id;
  }

}