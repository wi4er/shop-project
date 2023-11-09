import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../model/directory.entity';
import { PointEntity } from '../model/point.entity';
import { DirectoryInput } from '../input/directory.input';

export class PointInsertOperation {

  constructor(
    private trans: EntityManager,
  ) {
  }

  async save(created: DirectoryEntity, input: DirectoryInput) {
    for (const item of input.point ?? []) {
      const inst = new PointEntity();
      inst.id = item;
      inst.directory = created;

      await this.trans.save(inst);
    }
  }

}