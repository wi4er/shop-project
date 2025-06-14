import { ApiProperty } from '@nestjs/swagger';

export class ElementAttributeView {

  @ApiProperty()
  attribute: string

  @ApiProperty()
  element: string;

}