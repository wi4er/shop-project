import { ApiProperty } from '@nestjs/swagger';

export class SectionPropertyRender {

  @ApiProperty()
  property: string;

  @ApiProperty()
  section: string;

}