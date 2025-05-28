import { EntityManager, In } from 'typeorm';
import { BlockEntity } from '../../content/model/block/block.entity';
import { FormEntity } from '../model/form.entity';

export class FormDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: string[]) {
    const formRepo = this.manager.getRepository(FormEntity);

    const result = [];
    const list = await formRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await formRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}