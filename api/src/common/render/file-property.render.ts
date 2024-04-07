import { ApiProperty } from '@nestjs/swagger';

export class FilePropertyRender {

  @ApiProperty()
  property: string;

  @ApiProperty()
  file: number;

}