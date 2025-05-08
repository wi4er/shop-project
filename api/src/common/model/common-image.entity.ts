import { BaseEntity } from 'typeorm';
import { FileEntity } from '../../storage/model/file.entity';

export abstract class CommonImageEntity<T extends BaseEntity>
  extends BaseEntity {

  parent: T;

  image: FileEntity;

}