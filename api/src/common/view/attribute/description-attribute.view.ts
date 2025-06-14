import { ApiProperty } from '@nestjs/swagger';

export class DescriptionAttributeView {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  lang: string;

}