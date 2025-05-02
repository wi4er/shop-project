import { DirectoryEntity } from '../model/directory.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { PermissionRender } from '../../common/render/permission.render';
import { StringAttributeRender } from '../../common/render/string-attribute.render';
import { PointAttributeRender } from '../../common/render/point-attribute.render';

export class DirectoryRender {

  constructor(item: DirectoryEntity) {
    this.id = item.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;

    this.attribute = [
      ...item.string.map(str => ({
        string: str.string,
        attribute: str.attribute.id,
        lang: str.lang?.id,
      })),
      ...item.point.map(val => ({
        attribute: val.attribute.id,
        point: val.point.id,
        directory: val.point.directory.id,
      })),
    ];
    this.flag = item.flag.map(fl => fl.flag.id);
    this.permission = item.permission?.map(it => ({
      method: it.method,
      group: it.group?.id,
    }));
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  version: number;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {$ref: getSchemaPath(StringAttributeRender)},
        {$ref: getSchemaPath(PointAttributeRender)},
      ],
    },
  })
  attribute: Array<
    StringAttributeRender
    | PointAttributeRender
  >;


  @ApiProperty()
  flag: Array<string>;

  @ApiProperty({
    type: [PermissionRender],
  })
  permission?: Array<PermissionRender>;

}