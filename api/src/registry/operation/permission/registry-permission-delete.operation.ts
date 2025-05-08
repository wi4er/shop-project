import { EntityManager, In } from 'typeorm';
import { RegistryPermissionEntity } from '../../model/registry-permission.entity';

export class RegistryPermissionDeleteOperation {

  constructor(
    private manager: EntityManager,
  ) {

  }

  async save(idList: number[]): Promise<number[]> {
    const dirRepo = this.manager.getRepository(RegistryPermissionEntity);

    const result = [];
    const list = await dirRepo.find({where: {id: In(idList)}});

    for (const item of list) {
      await dirRepo.delete(item.id);
      result.push(item.id);
    }

    return result;
  }

}