import { EntityManager, In } from 'typeorm';
import { UserEntity } from '../../model/user.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class UserDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {

  }

  /**
   *
   * @param id
   * @private
   */
  private async checkUser(id: string): Promise<UserEntity> {
    const userRepo = this.manager.getRepository<UserEntity>(UserEntity);
    const inst = await userRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, 'Wrong user id!');
  }

  /**
   *
   * @param idList
   */
  async save(idList: string[]) {
    const userRepo = this.manager.getRepository(UserEntity);

    const result = [];

    for (const item of idList) {
      await this.checkUser(item)
      await userRepo.delete(item);
      result.push(+item);
    }

    return result;
  }

}