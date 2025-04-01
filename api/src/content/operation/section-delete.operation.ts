import { EntityManager, In } from 'typeorm';
import { SectionEntity } from '../model/section.entity';

export class SectionDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: string[]) {
    const sectionRepo = this.manager.getRepository(SectionEntity);

    const result = [];
    const list = await sectionRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await sectionRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}