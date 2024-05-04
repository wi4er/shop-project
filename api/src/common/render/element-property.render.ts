import { ApiProperty } from '@nestjs/swagger';

export class ElementPropertyRender {

  @ApiProperty()
  property: string

  @ApiProperty()
  element: string;

}