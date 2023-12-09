import { EntityManager } from 'typeorm';
import { UserGroupEntity } from '../model/user-group.entity';
import { UserGroup4stringEntity } from '../model/user-group4string.entity';
import { UserGroup2flagEntity } from '../model/user-group2flag.entity';
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
  private async checkGroup(id: number): Promise<UserGroupEntity> {
    const groupRepo = this.trans.getRepository(UserGroupEntity);
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
  async save(id: number, input: UserGroupInput): Promise<number> {
    const beforeItem = await this.checkGroup(id);
    beforeItem.parent = await this.checkGroup(input.parent);

    await this.trans.save(beforeItem);
    const [stringList, pointList] = filterProperties(input.property);

    await new StringValueUpdateOperation(this.trans, UserGroup4stringEntity).save(beforeItem, stringList);
    await new FlagValueUpdateOperation(this.trans, UserGroup2flagEntity).save(beforeItem, input);


    return beforeItem.id;
  }

}