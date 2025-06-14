import { AttributeEntity } from '../../model/attribute/attribute.entity';
import { EntityManager } from 'typeorm';
import { AttributeAsPointEntity } from '../../model/attribute/attribute-as-point.entity';
import { DirectoryEntity } from '../../../registry/model/directory/directory.entity';
import { WrongDataException } from '../../../exception/wrong-data/wrong-data.exception';

export class AttributeAsPointInsertOperation {

  created: AttributeAsPointEntity;

  constructor(
    private manager: EntityManager,
  ) {
    this.created = new AttributeAsPointEntity();
  }

  /**
   *
   */
  private async checkDirectory(id: string): Promise<DirectoryEntity> {
    return WrongDataException.assert(
      await this.manager
        .getRepository(DirectoryEntity)
        .findOne({where: {id}}),
      `Directory with id >> ${id} << not found!`,
    );
  }

  /**
   *
   */
  async save(created: AttributeEntity, directory: string): Promise<any> {
    this.created.directory = await this.checkDirectory(
      WrongDataException.assert(directory, 'Directory id expected!')
    );
    this.created.parent = created;

    await this.manager.save(this.created)
      .catch(err => {
        throw new WrongDataException(err.message);
      });
  }

}