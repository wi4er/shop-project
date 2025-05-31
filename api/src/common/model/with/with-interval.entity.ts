import { BaseEntity } from 'typeorm';
import { CommonIntervalEntity } from '../common/common-interval.entity';

export abstract class WithIntervalEntity<T extends BaseEntity>
  extends BaseEntity {

  interval: CommonIntervalEntity<T>[];

}