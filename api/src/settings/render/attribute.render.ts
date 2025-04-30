import { AttributeEntity, AttributeType } from '../model/attribute.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeRender } from '../../common/render/string-attribute.render';
import { PointAttributeRender } from '../../common/render/point-attribute.render';

export class AttributeRender {

  constructor(item: AttributeEntity) {
    this.id = item.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.type = item.type;
    this.version = item.version;

    this.directory = item.asDirectory?.directory?.id ?? null;
    if (item.type === AttributeType.ELEMENT) {
      this.block = item.asElement.block.id;
    } else if (item.type === AttributeType.SECTION) {
      this.block = item.asSection.block.id;
    } else {
      this.block = null;
    }
    this.collection = item.asFile?.collection?.id ?? null;

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

  @ApiProperty()
  type: string;

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

  @ApiProperty()
  directory: string | null;

  @ApiProperty()
  block: number | null;

  @ApiProperty()
  collection: string | null;

}