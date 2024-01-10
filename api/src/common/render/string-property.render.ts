import { ApiProperty } from '@nestjs/swagger';

export class StringPropertyRender {

  @ApiProperty()
  string: string;

  @ApiProperty()
  property: string;

  @ApiProperty({
    required: false,
  })
  lang?: string;

}