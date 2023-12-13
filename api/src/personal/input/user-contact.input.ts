import { ApiProperty } from '@nestjs/swagger';
import { UserContactType } from "../model/contact.entity";
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PropertyValueInput } from '../../common/input/property-value.input';

export class UserContactInput implements WithPropertyInput, WithFlagInput {

  @ApiProperty()
  id: string;

  @ApiProperty()
  type: UserContactType;

  property: PropertyValueInput[];

  @ApiProperty({ type: [ String ] })
  flag: string[];

}