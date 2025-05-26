import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AccessInput } from '../../input/access.input';
import { AccessEntity } from '../../model/access/access.entity';
import { AccessTarget } from '../../model/access/access-target';
import { AccessMethod } from '../../model/access/access-method';

export class AccessInsertOperation {

  created: AccessEntity;

  constructor(
    private transaction: EntityManager,
  ) {
    this.created = new AccessEntity();
  }

  /**
   *
   */
  async save(input: AccessInput): Promise<number> {
    // this.created.target = WrongDataException.assert(
    //   AccessTarget[input.target],
    //   `Wrong access target, [${Reflect.ownKeys(AccessTarget).join(', ')}] expected!`,
    // );
    // this.created.method = WrongDataException.assert(
    //   AccessMethod[input.method],
    //   `Wrong access method, [${Reflect.ownKeys(AccessMethod).join(', ')}] expected!`,
    // );

    try {
      await this.transaction.insert(AccessEntity, this.created);
    } catch (err) {
      throw new WrongDataException(err.detail);
    }

    await this.transaction.save(this.created);

    return this.created.id;
  }

}