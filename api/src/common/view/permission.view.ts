import { ApiProperty } from '@nestjs/swagger';

export class PermissionView {

  @ApiProperty()
  method: string;

  @ApiProperty()
  group: string;

}