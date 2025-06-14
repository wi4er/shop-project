import { ApiProperty } from '@nestjs/swagger';

export class PointAttributeView {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  point: string;

  @ApiProperty()
  directory: string;

}