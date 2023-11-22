import { BaseEntity } from 'typeorm';
import { PropertyEntity } from '../../settings/model/property.entity';
import { LangEntity } from '../../settings/model/lang.entity';

export interface CommonStringEntity<P extends BaseEntity> {

  id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  version: number;
  string: string;

  parent: P;
  property: PropertyEntity;
  lang?: LangEntity;

}