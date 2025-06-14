import { EntityManager } from 'typeorm';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';
import { ConfigurationEntity } from '../../model/configuration/configuration.entity';
import { ConfigurationInput } from '../../input/configuration/configuration.input';

export class ConfigurationInsertOperation {

  created: ConfigurationEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new ConfigurationEntity();
  }

  async save(input: ConfigurationInput): Promise<string> {
    this.created.id = input.id;
    this.created.value = input.value;

    try {
      await this.manager.insert(ConfigurationEntity, this.created)
    } catch(err) {
      throw new WrongDataException(err.message)
    }

    return this.created.id;
  }

}