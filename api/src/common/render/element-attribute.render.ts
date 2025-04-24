import { ApiProperty } from '@nestjs/swagger';

export class ElementAttributeRender {

  @ApiProperty()
  attribute: string

  @ApiProperty()
  element: string;

}