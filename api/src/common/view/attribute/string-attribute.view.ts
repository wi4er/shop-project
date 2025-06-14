import { ApiProperty } from '@nestjs/swagger';

export class StringAttributeView {

  @ApiProperty()
  string: string;

  @ApiProperty()
  attribute: string;

  @ApiProperty({
    required: false,
  })
  lang?: string;

}