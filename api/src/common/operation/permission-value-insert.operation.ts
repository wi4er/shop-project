import { BaseEntity, EntityManager } from 'typeorm';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { WithPermissionInput } from '../input/with-permission.input';
import { GroupEntity } from '../../personal/model/group/group.entity';
import { CommonPermissionEntity } from '../model/common-permission.entity';
import { PermissionOperation } from '../../permission/model/permission-operation';

export class PermissionValueInsertOperation<T extends BaseEntity> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonPermissionEntity<T>,
  ) {
  }

  /**
   *
   */
  private async checkGroup(id?: string): Promise<GroupEntity | null> {
    if (!id) return null;
    const groupRepo = this.trans.getRepository(GroupEntity);

    return WrongDataException.assert(
      await groupRepo.findOne({where: {id}}),
      `User group with id >> ${id} << not found!`,
    );
  }

  /**
   *
   * Добавляет доступ для админа
   */
  private async insertAdmin(created: T) {
    if (!process.env.ADMIN_GROUP) return;

    const inst = new this.entity();
    inst.parent = created;
    inst.group = await this.checkGroup(process.env.ADMIN_GROUP);
    inst.method = PermissionOperation.ALL;

    await this.trans.save(inst);
  }

  /**
   *
   */
  async save(created: T, input: WithPermissionInput) {
    await this.insertAdmin(created);

    for (const item of input.permission ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.group = await this.checkGroup(item.group);
      inst.method = item.method;

      await this.trans.save(inst)
        .catch(err => {
          throw new WrongDataException(err.detail);
        });
    }
  }

}