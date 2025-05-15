import { EntityManager, In } from 'typeorm';
import { AccessEntity } from '../../model/access/access.entity';

export class AccessDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {

  }

  async save(idList: number[]): Promise<number[]> {
    const dirRepo = this.manager.getRepository(AccessEntity);

    const result = [];
    const list = await dirRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await dirRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}