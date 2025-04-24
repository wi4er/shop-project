import { EntityManager } from 'typeorm';
import { GroupEntity } from '../model/group.entity';
import { Group4stringEntity } from '../model/group4string.entity';
import { Group2flagEntity } from '../model/group2flag.entity';
import { StringValueUpdateOperation } from '../../common/operation/string-value-update.operation';
import { FlagValueUpdateOperation } from '../../common/operation/flag-value-update.operation';
import { UserGroupInput } from '../input/user-group.input';
import { filterAttributes } from '../../common/input/filter-attributes';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class UserGroupUpdateOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkGroup(id: string): Promise<GroupEntity> {
    const groupRepo = this.trans.getRepository(GroupEntity);

    return WrongDataException.assert(
      await groupRepo.findOne({
        where: {id},
        relations: {
          string: {attribute: true},
          flag: {flag: true},
        },
      }),
      `User group with id ${id} not found!`
    );
  }

  /**
   *
   */
  async save(id: string, input: UserGroupInput): Promise<string> {
    const beforeItem = await this.checkGroup(id);
    beforeItem.parent = await this.checkGroup(input.parent);

    await this.trans.save(beforeItem);

    await new FlagValueUpdateOperation(this.trans, Group2flagEntity).save(beforeItem, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueUpdateOperation(this.trans, Group4stringEntity).save(beforeItem, stringList);

    return beforeItem.id;
  }

}