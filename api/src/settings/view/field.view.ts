import { FlagEntity } from '../model/flag/flag.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeView } from '../../common/view/attribute/string-attribute.view';
import { PointAttributeView } from '../../common/view/attribute/point-attribute.view';
import { FieldEntity } from '../model/field/field.entity';

export class FieldView {

  constructor(item: FieldEntity) {
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

}