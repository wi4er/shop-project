import { EntityManager, In } from 'typeorm';
import { FieldEntity } from '../../model/field/field.entity';

export class FieldDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: string[]) {
    const fieldRepo = this.manager.getRepository(FieldEntity);

    const result = [];
    const list = await fieldRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await fieldRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}