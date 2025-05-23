import { UserEntity } from '../model/user/user.entity';
import { EntityManager } from 'typeorm';
import { UserInput } from '../input/user.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { filterAttributes } from '../../common/input/filter-attributes';
import { StringValueInsertOperation } from '../../common/operation/string-value-insert.operation';
import { User4stringEntity } from '../model/user/user4string.entity';
import { FlagValueInsertOperation } from '../../common/operation/flag-value-insert.operation';
import { User2flagEntity } from '../model/user/user2flag.entity';
import { User2userContactInsertOperation } from './user/user2user-contact-insert.operation';
import { User2userGroupInsertOperation } from './user/user2user-group-insert.operation';
import { ContactEntity } from '../model/contact/contact.entity';
import { AuthInput } from '../input/auth.input';
import { EncodeService } from '../service/encode/encode.service';
import { User2groupEntity } from '../model/user/user2group.entity';
import { GroupEntity } from '../model/group/group.entity';

export class MyselfInsertOperation {

  created: UserEntity;

  constructor(
    private trans: EntityManager,
    private encodeService: EncodeService,
  ) {
    this.created = new UserEntity();
  }

  /**
   *
   * @param login
   * @private
   */
  private async checkLogin(login: string): Promise<string> {
    WrongDataException.assert(login, 'UserEntity login expected!');

    const contactRepo = this.trans.getRepository(UserEntity);
    const inst = await contactRepo.findOne({where: {login}});
    WrongDataException.assert(!inst, `Wrong user login ${login}!`);

    return login;
  }

  /**
   *
   * @param password
   * @private
   */
  private async checkPassword(password: string): Promise<string> {
    WrongDataException.assert(password, 'UserEntity password expected!');

    return this.encodeService.toSha256(password);
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkGroup(id: string): Promise<GroupEntity> {
    const groupRepo = this.trans.getRepository(GroupEntity);

    return WrongDataException.assert(
      await groupRepo.findOne({where: {id}}),
      `Wrong user group ${id}!`,
    );
  }

  /**
   *
   * @private
   */
  private async checkPublicGroup() {
    if (!process.env.PUBLIC_GROUP) return;

    const inst = new User2groupEntity();
    inst.group = await this.checkGroup(process.env.PUBLIC_GROUP);
    inst.parent = this.created;

    return this.trans.save(inst);
  }

  /**
   *
   * @param input
   */
  async save(input: AuthInput): Promise<string> {
    this.created.login = await this.checkLogin(input.login);
    this.created.hash = await this.checkPassword(input.password);

    await this.trans.save(this.created);
    await this.checkPublicGroup();

    return this.created.id;
  }

}