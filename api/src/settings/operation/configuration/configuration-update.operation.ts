import { EntityManager } from 'typeorm';
import { NoDataException } from '../../../exception/no-data/no-data.exception';
import { ConfigurationInput } from '../../input/configuration.input';
import { ConfigurationEntity } from '../../model/configuration.entity';
import { ElementEntity } from '../../../content/model/element.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class ConfigurationUpdateOperation {

  constructor(
    private manager: EntityManager,
  ) {
  }

  /**
   *
   * @param id
   * @private
   */
  private async checkConfig(id: string): Promise<ConfigurationEntity> {
    const flagRepo = this.manager.getRepository(ConfigurationEntity);

    const inst = await flagRepo.findOne({where: {id}});
    NoDataException.assert(inst, `Configuration with id ${id} not found!`);

    return inst;
  }

  /**
   *
   * @param id
   * @param input
   */
  async save(id: string, input: ConfigurationInput): Promise<string> {
    const beforeItem = await this.checkConfig(id);

    await this.manager.update(ConfigurationEntity, {id}, {
      id:  input.id,
      value: input.value,
    });

    return input.id;
  }

}