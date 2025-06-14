import { ApiProperty } from '@nestjs/swagger';
import { WithAttributeInput } from '../../../common/input/with-attribute.input';
import { WithFlagInput } from '../../../common/input/with-flag.input';
import { AttributeValueInput } from '../../../common/input/attribute/attribute-value.input';

export class GroupInput implements WithAttributeInput, WithFlagInput {

  @ApiProperty()
  id?: string | null;
  parent: string | null;
  attribute: AttributeValueInput[];

  @ApiProperty({ type: [ String ] })
  flag: string[];

}