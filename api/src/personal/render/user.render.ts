import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeRender } from '../../common/render/string-attribute.render';
import { PointAttributeRender } from '../../common/render/point-attribute.render';
import { UserEntity } from '../model/user.entity';

export class UserRender {

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
        {$ref: getSchemaPath(StringAttributeRender)},
      ],
    },
  })
  attribute: Array<StringAttributeRender | PointAttributeRender>;

  @ApiProperty()
  flag: Array<string>;

}