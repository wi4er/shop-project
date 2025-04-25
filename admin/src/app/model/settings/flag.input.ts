import { StringAttributeValue } from '../string-attribute-value';

export interface FlagInput {

  id?: string;
  color: string | null;
  icon: string | null;
  iconSvg: string | null;

  flag: string[];
  attribute: StringAttributeValue[];

}
