import { BaseEntity } from 'typeorm';
import { CommonLogEntity } from './common-log.entity';

export interface WithLogEntity<T extends BaseEntity>
  extends BaseEntity {

  log: CommonLogEntity<T>;

}