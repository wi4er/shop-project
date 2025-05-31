import { CommonImageEntity } from '../common/common-image.entity';
import { BaseEntity } from 'typeorm';

export abstract class WithImageEntity<T extends BaseEntity>
  extends BaseEntity {

  image: Array<CommonImageEntity<T>>;

}