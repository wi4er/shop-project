import { BaseEntity, EntityManager, IsNull } from 'typeorm';
import { CommonPermissionEntity } from '../model/common-permission.entity';
import { GroupEntity } from '../../personal/model/group/group.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { WithPermissionInput } from '../input/with-permission.input';
import { WithPermissionEntity } from '../model/with-permission.entity';
import { PermissionOperation } from '../../permission/model/permission-operation';

export class PermissionValueUpdateOperation<T extends WithPermissionEntity<BaseEntity>> {

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
   */
  async save(beforeItem: T, input: WithPermissionInput) {
    const current: { [key: string]: Array<PermissionOperation> } = {};

    for (const item of beforeItem.permission ?? []) {
      const {id = ''} = item.group ?? {};

      if (current[id]) current[id].push(item.method);
      else current[id] = [item.method];
    }

    for (const item of input?.permission ?? []) {
      const group = item.group ?? '';

      if (current[group]?.includes(item.method)) {
        current[group].splice(current[group].indexOf(item.method), 1);
      } else {
        const inst = new this.entity();
        inst.parent = beforeItem;
        group ? inst.group = await this.checkGroup(group) : null;
        inst.method = item.method;

        await this.trans.save(inst)
          .catch(err => {
            throw new WrongDataException(err.detail);
          });
      }
    }

    for (const group in current) {
      for (const method of current[group]) {
        await this.trans.delete(this.entity, {
          parent: beforeItem,
          method: method,
          group: group || IsNull(),
        });
      }
    }
  }

}