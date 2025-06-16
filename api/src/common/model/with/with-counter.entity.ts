import { BaseEntity } from 'typeorm';
import { CommonCounterEntity } from '../common/common-counter.entity';

export abstract class WithCounterEntity<T extends BaseEntity>
  extends BaseEntity {

  counter: CommonCounterEntity<T>[];

}