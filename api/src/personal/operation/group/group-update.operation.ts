import { EntityManager } from 'typeorm';
import { GroupEntity } from '../../model/group/group.entity';
import { Group4stringEntity } from '../../model/group/group4string.entity';
import { Group2flagEntity } from '../../model/group/group2flag.entity';
import { GroupInput } from '../../input/group/group.input';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class GroupUpdateOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  /**
   *
   */
  private async checkGroup(id: string): Promise<GroupEntity> {
    return WrongDataException.assert(
      await this.trans
        .getRepository(GroupEntity)
        .findOne({
          where: {id},
          relations: {
            string: {attribute: true},
            flag: {flag: true},
          },
        }),
      `User group with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(id: string, input: GroupInput): Promise<string> {
    const beforeItem = await this.checkGroup(id);
    beforeItem.parent = await this.checkGroup(input.parent);

    await this.trans.save(beforeItem);

    await new FlagValueOperation(this.trans, Group2flagEntity).save(beforeItem, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.trans, Group4stringEntity).save(beforeItem, pack.string);

    return beforeItem.id;
  }

}