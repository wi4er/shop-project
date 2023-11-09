import { EntityManager } from 'typeorm';
import { LangEntity } from '../model/lang.entity';
import { Lang2stringEntity } from '../model/lang2string.entity';
import { PropertyEntity } from '../../property/model/property.entity';
import { Lang2flagEntity } from '../model/lang2flag.entity';
import { FlagEntity } from '../../flag/model/flag.entity';
import { LangInput } from '../input/lang.input';

export class LangInsertOperation {

  created: LangEntity;
  manager: EntityManager;

  constructor(
    private item: LangInput,
  ) {
    this.created = new LangEntity();
    this.created.id = this.item.id;
  }

  async save(manager: EntityManager): Promise<LangEntity> {
    this.manager = manager;
    const langRepo = this.manager.getRepository(LangEntity);

    await this.manager.transaction(async (trans: EntityManager) => {
      await trans.save(this.created);

      for await (const prop of this.addProperty()) {
        await trans.save(prop);
      }

      for await (const flag of this.addFlag()) {
        await trans.save(flag);
      }
    });

    return langRepo.findOne({
      where: {id: this.item.id},
      loadRelationIds: true,
    });
  }

  async* addProperty() {
    const propRepo = this.manager.getRepository(PropertyEntity);
    const langRepo = this.manager.getRepository(LangEntity);

    for (const item of this.item.property ?? []) {
      const inst = new Lang2stringEntity();
      inst.parent = this.created;
      inst.property = await propRepo.findOne({where: {id: item.property}});
      inst.string = item.string;
      inst.lang = await langRepo.findOne({where: {id: item.lang}});

      yield inst;
    }
  }

  async* addFlag() {
    const flagRepo = this.manager.getRepository(FlagEntity);

    for (const item of this.item.flag ?? []) {
      const inst = new Lang2flagEntity();
      inst.parent = this.created;
      inst.flag = await flagRepo.findOne({where: {id: item}});

      yield inst;
    }
  }

}