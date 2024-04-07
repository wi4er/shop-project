import { EntityManager, In } from 'typeorm';
import { FileEntity } from '../model/file.entity';
import { CollectionEntity } from '../model/collection.entity';

export class CollectionDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: string[]): Promise<string[]> {
    const colRepo = this.manager.getRepository(CollectionEntity);

    const result = [];
    const list = await colRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await colRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}