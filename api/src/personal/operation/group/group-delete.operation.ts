import { EntityManager } from 'typeorm';
import { GroupEntity } from '../../model/group/group.entity';
import { NoDataException } from '../../../exception/no-data/no-data.exception';

export class GroupDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkGroup(id: string): Promise<GroupEntity> {
    const groupRepo = this.manager.getRepository<GroupEntity>(GroupEntity);
    const inst = await groupRepo.findOne({where: {id}});

    return NoDataException.assert(inst, `Group id >> ${id} << not found!`);
  }

  /**
   *
   * @param idList
   */
  async save(idList: string[]) {
    const groupRepo = this.manager.getRepository(GroupEntity);
    const result = [];

    for (const item of idList) {
      await this.checkGroup(item);
      await groupRepo.delete(item);
      result.push(item);
    }

    return result;
  }

}