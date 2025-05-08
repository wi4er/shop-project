import { ApiProperty } from '@nestjs/swagger';
import { PermissionRender } from '../../common/render/permission.render';
import { PermissionMethod, RegistryEntity, RegistryPermissionEntity } from '../model/registry-permission.entity';

export class RegistryPermissionRender {

  constructor(item: RegistryPermissionEntity) {
    this.id = item.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;
    this.method = item.method;
    this.entity = item.entity;

    this.permission = item.permission?.map(it => ({
      method: it.method,
      group: it.group?.id,
    }));
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  version: number;

  method: PermissionMethod;
  entity: RegistryEntity;

  @ApiProperty({
    type: [PermissionRender],
  })
  permission?: Array<PermissionRender>;

}