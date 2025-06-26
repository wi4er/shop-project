import { AttributeEntity, AttributeType } from '../model/attribute/attribute.entity';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeView } from '../../common/view/attribute/string-attribute.view';
import { PointAttributeView } from '../../common/view/attribute/point-attribute.view';

export class AttributeView {

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
  directory: string | null;

  @ApiProperty()
  block: string | null;

  @ApiProperty()
  collection: string | null;

}