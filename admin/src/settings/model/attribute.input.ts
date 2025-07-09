import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface AttributeInput {

  id?: string;
  type: string;

  block: string | null;
  directory: string | null;
  collection: string | null;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
