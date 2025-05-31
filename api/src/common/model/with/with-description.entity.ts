import { BaseEntity } from 'typeorm';
import { CommonDescriptionEntity } from '../common/common-description.entity';

export interface WithDescriptionEntity<T extends BaseEntity>
  extends BaseEntity {

  description: Array<CommonDescriptionEntity<T>>;
  
}