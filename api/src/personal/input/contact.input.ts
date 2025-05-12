import { ApiProperty } from '@nestjs/swagger';
import { UserContactType } from "../model/contact/contact.entity";
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { AttributeValueInput } from '../../common/input/attribute-value.input';

export class ContactInput implements WithAttributeInput, WithFlagInput {

  @ApiProperty()
  id: string;

  @ApiProperty()
  type: UserContactType;

  attribute: AttributeValueInput[];

  @ApiProperty({ type: [ String ] })
  flag: string[];

}