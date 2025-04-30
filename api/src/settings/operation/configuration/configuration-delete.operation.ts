import { EntityManager, In } from 'typeorm';
import { ConfigurationEntity } from '../../model/configuration.entity';

export class ConfigurationDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  async save(idList: string[]) {
    const configRepo = this.manager.getRepository(ConfigurationEntity);

    const result = [];
    const list = await configRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await configRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}