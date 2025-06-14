import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeView } from '../../common/view/attribute/string-attribute.view';
import { PointAttributeView } from '../../common/view/attribute/point-attribute.view';
import { UserEntity } from '../model/user/user.entity';

export class UserView {

  constructor(item: UserEntity) {
    this.id = item.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;
    this.login = item.login;

    this.contact = item.contact.map(cn => ({
      contact: cn.contact.id,
      value: cn.value,
    }));
    this.group = item.group.map(gr => gr.group.id);

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
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  login: string;

  @ApiProperty()
  contact: Array<{
    contact: string;
    value: string;
  }>

  @ApiProperty()
  group: Array<string>;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {$ref: getSchemaPath(StringAttributeView)},
      ],
    },
  })
  attribute: Array<StringAttributeView | PointAttributeView>;

  @ApiProperty()
  flag: Array<string>;

}