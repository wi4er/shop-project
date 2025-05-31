import { BaseEntity, EntityManager } from 'typeorm';
import { CommonFlagEntity } from '../../model/common/common-flag.entity';
import { WithFlagInput } from '../../input/with-flag.input';
import { FlagEntity } from '../../../settings/model/flag.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class FlagValueInsertOperation<T extends BaseEntity> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonFlagEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkFlag(id: string): Promise<FlagEntity> {
    const flagRepo = this.trans.getRepository(FlagEntity);

    return WrongDataException.assert(
      await flagRepo.findOne({where: {id}}),
      `Flag with id >> ${id} << not found!`
    );
  }

  /**
   *
   */
  async save(created: T, input: WithFlagInput) {
    for (const item of input.flag ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.flag = await this.checkFlag(item);

      await this.trans.save(inst)
        .catch(err => {
          throw new WrongDataException(err.detail);
        });
    }
  }

}