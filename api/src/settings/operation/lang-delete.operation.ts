import { EntityManager, In } from 'typeorm';
import { LangEntity } from '../model/lang.entity';

export class LangDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: string[]) {
    const langRepo = this.manager.getRepository(LangEntity);

    const result = [];
    const list = await langRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await langRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}