import { EntityManager } from 'typeorm';
import { GroupEntity } from '../../model/group.entity';
import { Group4stringEntity } from '../../model/group4string.entity';
import { Group2flagEntity } from '../../model/group2flag.entity';
import { StringValueInsertOperation } from '../../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../../common/operation/flag-value-insert.operation';
import { UserGroupInput } from '../../input/user-group.input';
import { filterAttributes } from '../../../common/input/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class UserGroupInsertOperation {

  created: GroupEntity;

  constructor(
    private trans: EntityManager,
  ) {
    this.created = new GroupEntity();
  }

  /**
   *
   */
  async checkGroup(id: string): Promise<GroupEntity> {
    const groupRepo = this.trans.getRepository<GroupEntity>(GroupEntity);

    return WrongDataException.assert(
      await groupRepo.findOne({where: {id}}),
      `Group with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(input: UserGroupInput): Promise<string> {
    this.created.id = input.id;
    this.created.parent = input.parent ? await this.checkGroup(input.parent) : null;

    await this.trans.save(this.created);

    await new FlagValueInsertOperation(this.trans, Group2flagEntity).save(this.created, input);

    const [stringList] = filterAttributes(input.attribute);
    await new StringValueInsertOperation(this.trans, Group4stringEntity).save(this.created, stringList);

    return this.created.id;
  }

}