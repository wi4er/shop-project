import { CommonAttributeValue } from '../common/common-attribute-value';

export interface PointInput {

  id: string;
  directory: string;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
