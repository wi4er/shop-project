import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../directory/model/directory.entity';
import { DirectoryInput } from '../../directory/input/directory.input';
import { PointEntity } from '../../directory/model/point.entity';

export class PointValueUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(beforeItem: DirectoryEntity, input: DirectoryInput) {

  }

}