import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { AccessEntity } from '../../model/access/access.entity';
import { AccessInput } from '../../input/access/access.input';
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
    id: string,
    input: AccessInput,
  ): Promise<string> {

    return id;
  }

}