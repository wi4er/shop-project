import { EntityManager } from 'typeorm';
import { GroupEntity } from '../../model/group/group.entity';
import { Group4stringEntity } from '../../model/group/group4string.entity';
import { Group2flagEntity } from '../../model/group/group2flag.entity';
import { GroupInput } from '../../input/group/group.input';
import { filterAttributes } from '../../../common/service/filter-attributes';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { FlagValueOperation } from '../../../common/operation/flag-value.operation';
import { StringValueOperation } from '../../../common/operation/attribute/string-value.operation';

export class GroupInsertOperation {

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
    return WrongDataException.assert(
      await this.trans
        .getRepository<GroupEntity>(GroupEntity)
        .findOne({where: {id}}),
      `Group with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(input: GroupInput): Promise<string> {
    this.created.id = input.id;
    this.created.parent = input.parent ? await this.checkGroup(input.parent) : null;

    await this.trans.save(this.created);

    await new FlagValueOperation(this.trans, this.created).save(Group2flagEntity, input.flag);

    const pack = filterAttributes(input.attribute);
    await new StringValueOperation(this.trans, this.created).save(Group4stringEntity, pack.string);

    return this.created.id;
  }

}