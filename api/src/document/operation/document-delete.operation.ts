import { EntityManager, In } from 'typeorm';
import { DocumentEntity } from '../model/document.entity';

export class DocumentDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: number[]) {
    const docRepo = this.manager.getRepository(DocumentEntity);

    const result = [];
    const list = await docRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await docRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}