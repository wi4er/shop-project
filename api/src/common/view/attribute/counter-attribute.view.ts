import { ApiProperty } from '@nestjs/swagger';

export class CounterAttributeView {

  @ApiProperty()
  attribute: string;

  @ApiProperty()
  counter: string;

  @ApiProperty()
  directory: string;

  @ApiProperty()
  count: number;

}