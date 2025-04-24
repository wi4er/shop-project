import { ApiProperty } from '@nestjs/swagger';

export class SectionAttributeRender {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  section: string;

}