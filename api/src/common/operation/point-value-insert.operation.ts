import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../../directory/model/directory.entity';
import { PointEntity } from '../../directory/model/point.entity';
import { DirectoryInput } from '../../directory/input/directory.input';

export class PointValueInsertOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  async save(created: DirectoryEntity, input: DirectoryInput) {

  }

}