import { BaseEntity, EntityManager } from 'typeorm';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { WithPermissionInput } from '../input/with-permission.input';
import { GroupEntity } from '../../personal/model/group.entity';
import { CommonPermissionEntity } from '../model/common-permission.entity';

export class PermissionValueInsertOperation<T extends BaseEntity> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonPermissionEntity<T>,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkGroup(id: number): Promise<GroupEntity> {
    const groupRepo = this.trans.getRepository(GroupEntity);

    const flag = await groupRepo.findOne({where: {id}});
    WrongDataException.assert(flag, 'Wrong flag!')

    return flag;
  }

  /**
   *
   * @param created
   * @param input
   */
  async save(created: T, input: WithPermissionInput) {
    for (const item of input.permission ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.group = await this.checkGroup(item.group);
      inst.method = item.method;

      await this.trans.save(inst);
    }
  }

}