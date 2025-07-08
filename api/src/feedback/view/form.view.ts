import { FormEntity } from '../model/form/form.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeView } from '../../common/view/attribute/string-attribute.view';
import { PointAttributeView } from '../../common/view/attribute/point-attribute.view';

export class FormView {

  constructor(item: FormEntity) {
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
    this.flag = item.flag.map(it => it.flag.id);
    this.field = item.field.map(it => it.field.id);
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

  @ApiProperty()
  field: Array<string>;

}