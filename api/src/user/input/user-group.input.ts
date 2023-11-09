import { ApiProperty } from '@nestjs/swagger';
import { WithPropertyInput } from '../../common/input/with-property.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { PropertyValueInput } from '../../common/input/property-value.input';

export class UserGroupInput implements WithPropertyInput, WithFlagInput {

  @ApiProperty()
  id?: number | null;

  parent: number | null;

  @ApiProperty({
    type: () => PropertyValueInput,
    description: 'User group property data list',
  })
  property: PropertyValueInput[];

  @ApiProperty({ type: [ String ] })
  flag: string[];

}