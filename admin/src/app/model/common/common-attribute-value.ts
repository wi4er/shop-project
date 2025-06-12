import { StringAttributeValue } from './string-attribute-value';
import { DescriptionAttributeValue } from './description-attribute-value';
import { IntervalAttributeValue } from './interval-attribute-value';

export type CommonAttributeValue = StringAttributeValue
  | DescriptionAttributeValue
  | IntervalAttributeValue;
