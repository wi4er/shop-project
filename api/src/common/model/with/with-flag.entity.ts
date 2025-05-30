import { BaseEntity } from 'typeorm';
import { CommonFlagEntity } from '../common/common-flag.entity';

export abstract class WithFlagEntity<T extends BaseEntity>
  extends BaseEntity {

  flag: CommonFlagEntity<T>[];

}