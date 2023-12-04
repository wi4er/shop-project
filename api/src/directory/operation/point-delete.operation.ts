import { EntityManager, In } from 'typeorm';
import { PointEntity } from '../model/point.entity';

export class PointDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {

  }

  async save(idList: string[]): Promise<string[]> {
    const pointRepo = this.manager.getRepository(PointEntity);

    const result = [];
    const list = await pointRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await pointRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}