import { EntityManager } from 'typeorm';
import { UserEntity } from '../model/user.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { UserGroupEntity } from '../model/user-group.entity';
import { NoDataException } from '../../exception/no-data/no-data.exception';

export class UserGroupDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {

  }

  /**
   *
   * @param id
   * @private
   */
  private async checkGroup(id: number): Promise<UserGroupEntity> {
    const groupRepo = this.manager.getRepository<UserGroupEntity>(UserGroupEntity);
    const inst = await groupRepo.findOne({where: {id}});

    return NoDataException.assert(inst, `Group id ${id} not found!`);
  }

  /**
   *
   * @param idList
   */
  async save(idList: number[]) {
    const groupRepo = this.manager.getRepository(UserGroupEntity);

    const result = [];

    for (const item of idList) {
      await this.checkGroup(item)
      await groupRepo.delete(item);
      result.push(+item);
    }

    return result;
  }

}