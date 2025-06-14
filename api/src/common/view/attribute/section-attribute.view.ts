import { ApiProperty } from '@nestjs/swagger';

export class SectionAttributeView {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  section: string;

}