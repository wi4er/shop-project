import { CommonAttributeValue } from '../../app/model/common/common-attribute-value';

export interface FlagInput {

  id?: string;
  color: string | null;
  icon: string | null;
  iconSvg: string | null;

  flag: string[];
  attribute: Array<CommonAttributeValue>;

}
