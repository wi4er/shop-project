import { BaseEntity, EntityManager } from 'typeorm';
import { CommonStringEntity } from '../model/common-string.entity';
import { WithPropertyInput } from '../input/with-property.input';
import { LangEntity } from '../../settings/model/lang.entity';
import { PropertyEntity } from '../../settings/model/property.entity';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export class PropertyInsertOperation<T extends BaseEntity> {

  constructor(
    private trans: EntityManager,
    private entity: new() => CommonStringEntity<T>,
  ) {

  }

  async save(created: T, input: WithPropertyInput) {
    const propRepo = this.trans.getRepository(PropertyEntity);
    const langRepo = this.trans.getRepository(LangEntity);

    for (const item of input.property ?? []) {
      const inst = new this.entity();
      inst.parent = created;
      inst.property = await propRepo.findOne({ where: { id: item.property } });
      inst.string = item.string;
      inst.lang = item.lang ? await langRepo.findOne({ where: { id: item.lang } }) : null;

      try {
        await this.trans.save(inst);
      } catch (err) {
        WrongDataException.assert(err.column !== 'propertyId', 'Wrong property!');
      }
    }
  }

}