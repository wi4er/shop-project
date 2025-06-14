import { ApiProperty } from '@nestjs/swagger';

export class FileAttributeView {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  file: number;

}