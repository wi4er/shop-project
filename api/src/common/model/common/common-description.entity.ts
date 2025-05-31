import { BaseEntity } from 'typeorm';
import { AttributeEntity } from '../../../settings/model/attribute.entity';
import { LangEntity } from '../../../settings/model/lang.entity';

export interface CommonDescriptionEntity<P extends BaseEntity>
  extends BaseEntity {

  id: number;
  parent: P;

  description: string;
  attribute: AttributeEntity;
  lang?: LangEntity;

}