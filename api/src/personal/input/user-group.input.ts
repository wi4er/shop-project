import { ApiProperty } from '@nestjs/swagger';
import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { AttributeValueInput } from '../../common/input/attribute-value.input';

export class UserGroupInput implements WithAttributeInput, WithFlagInput {

  @ApiProperty()
  id?: string | null;
  parent: string | null;
  attribute: AttributeValueInput[];

  @ApiProperty({ type: [ String ] })
  flag: string[];

}