import { ApiProperty } from '@nestjs/swagger';

export class PermissionRender {

  @ApiProperty()
  method: string;

  @ApiProperty()
  group: number;

}