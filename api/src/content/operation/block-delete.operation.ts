import { EntityManager, In } from 'typeorm';
import { BlockEntity } from '../model/block.entity';

export class BlockDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: number[]) {
    const blockRepo = this.manager.getRepository(BlockEntity);

    const result = [];
    const list = await blockRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await blockRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}