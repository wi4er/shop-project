import { StringAttributeValue } from './string-attribute-value';
import { DescriptionAttributeValue } from './description-attribute-value';
import { IntervalAttributeValue } from './interval-attribute-value';
import { PointAttributeValue } from './point-attribute-value';
import { CounterAttributeValueEntity } from './counter-attribute-value.entity';

export type CommonAttributeValue = StringAttributeValue
  | DescriptionAttributeValue
  | IntervalAttributeValue
  | PointAttributeValue
  | CounterAttributeValueEntity;

