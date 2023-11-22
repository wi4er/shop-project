import { LangEntity } from '../model/lang.entity';
import { EntityManager } from 'typeorm';
import { PropertyEntity } from '../../property/model/property.entity';
import { Lang2stringEntity } from '../model/lang2string.entity';
import { Lang2flagEntity } from '../model/lang2flag.entity';
import { FlagEntity } from '../../flag/model/flag.entity';
import { LangInput } from '../input/lang.input';

export class LangUpdateOperation {

  beforeItem: LangEntity;
  manager: EntityManager;

  constructor(
    private updateItem: LangInput,
  ) {
  }

  async save(manager: EntityManager): Promise<LangEntity> {
    this.manager = manager;
    const langRepo = this.manager.getRepository(LangEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      this.beforeItem = await langRepo.findOne({
        where: {id: this.updateItem.id},
        relations: {
          string: {property: true},
          flag: {flag: true},
        },
      });

      await this.addProperty(trans);
      await this.addFlag(trans);
    });

    return langRepo.findOne({
      where: {id: this.updateItem.id},
      loadRelationIds: true,
    });
  }

  async addProperty(trans: EntityManager) {
    const propRepo = this.manager.getRepository(PropertyEntity);
    const langRepo = this.manager.getRepository(LangEntity);

    const current: { [key: string]: Array<Lang2stringEntity> } = {};

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
        inst = new Lang2stringEntity();
      }

      inst.parent = this.beforeItem;
      inst.property = await propRepo.findOne({where: {id: item.property}});
      inst.string = item.string;
      inst.lang = await langRepo.findOne({where: {id: item.lang}});

      await trans.save(inst);
    }

    for (const prop of Object.values(current)) {
      for (const item of prop) {
        await trans.delete(Lang2stringEntity, item.id);
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
        const inst = new Lang2flagEntity();
        inst.parent = this.beforeItem;
        inst.flag = await flagRepo.findOne({where: {id: item}});

        await trans.save(inst);
      }
    }

    for (const item of current) {
      await trans.delete(Lang2flagEntity, {
        parent: this.beforeItem.id,
        flag: item,
      });
    }
  }

}