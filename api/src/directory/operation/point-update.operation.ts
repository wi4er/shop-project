import { EntityManager } from 'typeorm';
import { DirectoryEntity } from '../model/directory.entity';
import { PointEntity } from '../model/point.entity';
import { DirectoryInput } from '../input/directory.input';

export class PointUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(beforeItem: DirectoryEntity, input: DirectoryInput) {
    const current: Array<string> = beforeItem.point.map(it => it.id);

    for (const item of input.point ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new PointEntity();
        inst.id = item;
        inst.directory = beforeItem;

        await this.manager.save(inst);
      }
    }

    for (const item of current) {
      await this.manager.delete(PointEntity, {id: item});
    }
  }

}