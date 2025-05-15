import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AccessEntity } from '../../model/access/access.entity';
import { AccessInput } from '../../input/access.input';
import { AccessTarget } from '../../model/access/access-target';
import { AccessMethod } from '../../model/access/access-method';

export class AccessUpdateOperation {

  constructor(
    private transaction: EntityManager,
  ) {
  }

  /**
   *
   */
  async save(
    id: number,
    input: AccessInput,
  ): Promise<number> {
    try {
      await this.transaction.update(AccessEntity, {id}, {
        target: WrongDataException.assert(
          AccessTarget[input.target],
          `Wrong access target, [${Reflect.ownKeys(AccessTarget).join(', ')}] expected!`,
        ),
        method: WrongDataException.assert(
          AccessMethod[input.method],
          `Wrong access method, [${Reflect.ownKeys(AccessMethod).join(', ')}] expected!`,
        ),
      });
    } catch (err) {
      throw new WrongDataException(err.message);
    }

    return id;
  }

}