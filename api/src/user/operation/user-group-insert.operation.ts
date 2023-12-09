import { EntityManager } from 'typeorm';
import { UserGroupEntity } from '../model/user-group.entity';
import { UserGroup4stringEntity } from '../model/user-group4string.entity';
import { UserGroup2flagEntity } from '../model/user-group2flag.entity';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { UserGroupInput } from '../input/user-group.input';
import { filterProperties } from '../../common/input/filter-properties';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class UserGroupInsertOperation {

  created: UserGroupEntity;

  constructor(
    private trans: EntityManager,
  ) {
    this.created = new UserGroupEntity();
  }

  /**
   *
   * @param id
   */
  async checkGroup(id: number): Promise<UserGroupEntity> {
    const groupRepo = this.trans.getRepository<UserGroupEntity>(UserGroupEntity);
    const inst = await groupRepo.findOne({where: {id}});

    return WrongDataException.assert(inst, `Group id ${id} not found!`);
  }

  /**
   *
   * @param input
   */
  async save(input: UserGroupInput): Promise<number> {
    this.created.parent = input.parent ? await this.checkGroup(input.parent) : null;

    await this.trans.save(this.created);

    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueInsertOperation(this.trans, UserGroup4stringEntity).save(this.created, stringList);
    await new FlagValueInsertOperation(this.trans, UserGroup2flagEntity).save(this.created, input);

    return this.created.id;
  }

}