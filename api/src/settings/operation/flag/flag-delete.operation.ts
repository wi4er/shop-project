import { EntityManager, In } from 'typeorm';
import { FlagEntity } from '../../model/flag.entity';

export class FlagDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: string[]) {
    const flagRepo = this.manager.getRepository(FlagEntity);

    const result = [];
    const list = await flagRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await flagRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}