import { BaseEntity } from 'typeorm';
import { PropertyEntity } from '../../settings/model/property.entity';
import { LangEntity } from '../../settings/model/lang.entity';

export interface CommonStringEntity<P extends BaseEntity> {

  id: any;

  string: string;
  parent: P;
  property: PropertyEntity;
  lang?: LangEntity;

}