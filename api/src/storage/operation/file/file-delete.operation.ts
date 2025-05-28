import { EntityManager, In } from 'typeorm';
import { FileEntity } from '../../model/file.entity';

export class FileDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: number[]) {
    const fileRepo = this.manager.getRepository(FileEntity);

    const result = [];
    const list = await fileRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await fileRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}