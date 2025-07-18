import { DirectoryEntity } from '../model/directory/directory.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { PermissionView } from '../../common/view/permission.view';
import { StringAttributeView } from '../../common/view/attribute/string-attribute.view';
import { PointAttributeView } from '../../common/view/attribute/point-attribute.view';

export class DirectoryView {

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
        {$ref: getSchemaPath(StringAttributeView)},
        {$ref: getSchemaPath(PointAttributeView)},
      ],
    },
  })
  attribute: Array<
    StringAttributeView
    | PointAttributeView
  >;

  @ApiProperty()
  flag: Array<string>;

  @ApiProperty({
    type: [PermissionView],
  })
  permission?: Array<PermissionView>;

}