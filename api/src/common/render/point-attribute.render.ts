import { ApiProperty } from '@nestjs/swagger';

export class PointAttributeRender {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  point: string;

  @ApiProperty()
  directory: string;

}