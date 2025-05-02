import { EntityManager, In } from 'typeorm';
import { DirectoryEntity } from '../../model/directory.entity';

export class DirectoryDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {

  }

  async save(idList: string[]): Promise<string[]> {
    const dirRepo = this.manager.getRepository(DirectoryEntity);

    const result = [];
    const list = await dirRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await dirRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}