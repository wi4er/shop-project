import { StringPropertyValue } from '../string-property-value';

export interface Flag {

  id: string;
  created_at: string;
  updated_at: string;
  color: string | null;
  icon: string | null;
  iconSvg: string | null;

  flag: string[];
  property: StringPropertyValue[];

}
