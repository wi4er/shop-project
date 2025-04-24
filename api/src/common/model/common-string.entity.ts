import { BaseEntity } from 'typeorm';
import { AttributeEntity } from '../../settings/model/attribute.entity';
import { LangEntity } from '../../settings/model/lang.entity';

export interface CommonStringEntity<P extends BaseEntity> {

  id: any;

  string: string;
  parent: P;
  attribute: AttributeEntity;
  lang?: LangEntity;

}