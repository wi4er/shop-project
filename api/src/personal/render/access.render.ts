import { ApiProperty } from '@nestjs/swagger';
import { AccessEntity } from '../model/access/access.entity';
import { AccessTarget } from '../model/access/access-target';
import { AccessMethod } from '../model/access/access-method';
import { AccessGroup } from '../controller/access/access.controller';

export class AccessRender {

  constructor(item: AccessGroup) {
    this.target = item.target;
    this.group = item.list.map(it => ({
      group: it.group?.id ?? null,
      method: it.method,
    }))
  }

  @ApiProperty()
  target: AccessTarget;

  @ApiProperty()
  group: Array<{
    group: string | null;
    method: AccessMethod;
  }>;

}