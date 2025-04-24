import { ApiProperty } from '@nestjs/swagger';

export class FileAttributeRender {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  file: number;

}