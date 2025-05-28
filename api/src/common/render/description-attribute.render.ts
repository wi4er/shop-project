import { ApiProperty } from '@nestjs/swagger';

export class DescriptionAttributeRender {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  lang: string;

}