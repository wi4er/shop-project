import { BaseEntity, EntityManager } from 'typeorm';
import { CommonFlagEntity } from '../model/common-flag.entity';
import { WithFlagInput } from '../input/with-flag.input';
import { FlagEntity } from '../../settings/model/flag.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class FlagValueInsertOperation<T extends BaseEntity> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonFlagEntity<T>,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    const flagRepo = this.trans.getRepository(FlagEntity);
    const flag = await flagRepo.findOne({where: {id}});

    return  WrongDataException.assert(flag, `Flag with id ${id} not found!`);
  }

  /**
   *
   * @param created
   * @param input
   */
  async save(created: T, input: WithFlagInput) {
    for (const item of input.flag ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.flag = await this.checkFlag(item);

      await this.trans.save(inst);
    }
  }

}