import { EntityManager } from 'typeorm';
import { GroupEntity } from '../model/group.entity';
import { Group4stringEntity } from '../model/group4string.entity';
import { Group2flagEntity } from '../model/group2flag.entity';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { UserGroupInput } from '../input/user-group.input';
import { filterProperties } from '../../common/input/filter-properties';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class UserGroupUpdateOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkGroup(id: string): Promise<GroupEntity> {
    const groupRepo = this.trans.getRepository(GroupEntity);
    const inst = await groupRepo.findOne({
      where: {id},
      relations: {
        string: {property: true},
        flag: {flag: true},
      },
    });

    return WrongDataException.assert(inst, `User group with id ${id} not found!`);
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: UserGroupInput): Promise<string> {
    const beforeItem = await this.checkGroup(id);
    beforeItem.parent = await this.checkGroup(input.parent);

    await this.trans.save(beforeItem);
    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueUpdateOperation(this.trans, Group4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.trans, Group2flagEntity).save(beforeItem, input);


    return beforeItem.id;
  }

}