import { StringAttributeValue } from '../common/string-attribute-value';

export interface FlagEntity {

  id: string;
  created_at: string;
  updated_at: string;
  color: string | null;
  icon: string | null;
  iconSvg: string | null;

  flag: string[];
  attribute: StringAttributeValue[];

}
