import { FlagEntity } from '../model/flag.entity';
import { EntityManager } from 'typeorm';
import { Flag2stringEntity } from '../model/flag2string.entity';
import { Flag2flagEntity } from '../model/flag2flag.entity';
import { FlagInput } from '../input/flag.input';
import { PropertyEntity } from '../model/property.entity';
import { LangEntity } from '../model/lang.entity';

export class FlagUpdateOperation {

  beforeItem: FlagEntity;
  manager: EntityManager;

  constructor(
    private updateItem: FlagInput,
  ) {
  }

  async save(manager: EntityManager): Promise<FlagEntity> {
    this.manager = manager;
    const flagRepo = this.manager.getRepository(FlagEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      this.beforeItem = await flagRepo.findOne({
        where: {id: this.updateItem.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
        },
      });

      await this.addProperty(trans);
      await this.addFlag(trans);
    });

    return flagRepo.findOne({
      where: {id: this.updateItem.id},
      loadRelationIds: true,
    });
  }

  async addProperty(trans: EntityManager) {
    const propRepo = this.manager.getRepository(PropertyEntity);
    const langRepo = this.manager.getRepository(LangEntity);

    const current: { [key: string]: Array<Flag2stringEntity> } = {};

    for (const item of this.beforeItem.string) {
      if (!current[item.property.id]) {
        current[item.property.id] = [];
      }

      current[item.property.id].push(item);
    }

    for (const item of this.updateItem.property ?? []) {
      let inst;

      if (current[item.property]?.[0]) {
        inst = current[item.property].shift();
      } else {
        inst = new Flag2stringEntity();
      }

      inst.parent = this.beforeItem;
      inst.property = await propRepo.findOne({where: {id: item.property}});
      inst.string = item.string;
      inst.lang = await langRepo.findOne({where: {id: item.lang}});

      await trans.save(inst);
    }

    for (const prop of Object.values(current)) {
      for (const item of prop) {
        await trans.delete(Flag2stringEntity, item.id);
      }
    }
  }

  async addFlag(trans: EntityManager) {
    const flagRepo = this.manager.getRepository(FlagEntity);

    const current: Array<string> = this.beforeItem.flag.map(it => it.flag.id);

    for (const item of this.updateItem.flag ?? []) {
      if (current.includes(item)) {
        current.splice(current.indexOf(item), 1);
      } else {
        const inst = new Flag2flagEntity();
        inst.parent = this.beforeItem;
        inst.flag = await flagRepo.findOne({where: {id: item}});

        await trans.save(inst);
      }
    }

    for (const item of current) {
      await trans.delete(Flag2flagEntity, {
        parent: this.beforeItem.id,
        flag: item,
      });
    }
  }

}