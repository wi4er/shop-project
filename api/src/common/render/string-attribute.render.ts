import { ApiProperty } from '@nestjs/swagger';

export class StringAttributeRender {

  @ApiProperty()
  string: string;

  @ApiProperty()
  attribute: string;

  @ApiProperty({
    required: false,
  })
  lang?: string;

}