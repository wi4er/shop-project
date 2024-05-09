import { BaseEntity, EntityManager } from 'typeorm';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { WithPermissionInput } from '../input/with-permission.input';
import { GroupEntity } from '../../personal/model/group.entity';
import { CommonPermissionEntity } from '../model/common-permission.entity';
import { PermissionMethod } from '../../permission/model/permission-method';
import * as process from 'process';

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
    const group = await groupRepo.findOne({where: {id}});

    return WrongDataException.assert(group, `User group with id ${id} not found!`);
  }

  private async insertAdmin(created: T) {
    if (!process.env.ADMIN_GROUP) return;

    const inst = new this.entity();
    inst.parent = created;
    inst.group = await this.checkGroup(+process.env.ADMIN_GROUP);
    inst.method = PermissionMethod.ALL;

    await this.trans.save(inst);
  }

  /**
   *
   * @param created
   * @param input
   */
  async save(created: T, input: WithPermissionInput) {
    await this.insertAdmin(created);

    for (const item of input.permission ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.group = await this.checkGroup(item.group);
      inst.method = item.method;

      await this.trans.save(inst);
    }
  }

}