import { ApiProperty } from '@nestjs/swagger';

export class PointPropertyRender {

  @ApiProperty()
  property: string;

  @ApiProperty()
  point: string;

  @ApiProperty()
  directory: string;

}