import { ApiProperty } from '@nestjs/swagger';
import { AccessEntity } from '../model/access/access.entity';
import { AccessTarget } from '../model/access/access-target';
import { AccessMethod } from '../model/access/access-method';

export class AccessRender {

  constructor(item: AccessEntity) {
    this.id = item.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;
    this.method = item.method;
    this.target = item.target;
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  version: number;

  method: AccessMethod;
  target: AccessTarget;

}