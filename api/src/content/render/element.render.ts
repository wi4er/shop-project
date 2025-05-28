import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeRender } from '../../common/render/string-attribute.render';
import { PointAttributeRender } from '../../common/render/point-attribute.render';
import { ElementEntity } from '../model/element/element.entity';
import { ElementAttributeRender } from '../../common/render/element-attribute.render';
import { SectionAttributeRender } from '../../common/render/section-attribute.render';
import { PermissionRender } from '../../common/render/permission.render';
import { FileAttributeRender } from '../../common/render/file-attribute.render';
import { ImageRender } from '../../common/render/image.render';

@ApiExtraModels(
  StringAttributeRender,
  PointAttributeRender,
  ElementAttributeRender,
  SectionAttributeRender,
  PermissionRender,
)
export class ElementRender {

  constructor(item: ElementEntity) {
    this.id = item.id;
    this.block = item.block.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;
    this.sort = item.sort;
    this.section = item.parent.map(it => it.section.id);
    this.image = item.image.map(it => ({
      original: it.image.original,
      image: it.image.id,
      path: it.image.path,
      collection: it.image.collection.id,
    }));
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
      ...item.element.map(val => ({
        attribute: val.attribute.id,
        element: val.element.id,
      })),
      ...item.section.map(val => ({
        attribute: val.attribute.id,
        section: val.section.id,
      })),
      ...item.file.map(val => ({
        attribute: val.attribute.id,
        file: val.file.id,
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

  @ApiProperty({
    description: 'Id from content block',
  })
  block: string;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  sort: number;

  @ApiProperty()
  section: Array<string>;

  @ApiProperty()
  image: Array<ImageRender>;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {$ref: getSchemaPath(StringAttributeRender)},
        {$ref: getSchemaPath(PointAttributeRender)},
        {$ref: getSchemaPath(ElementAttributeRender)},
        {$ref: getSchemaPath(SectionAttributeRender)},
      ],
    },
  })
  attribute: Array<
    StringAttributeRender
    | PointAttributeRender
    | ElementAttributeRender
    | SectionAttributeRender
    | FileAttributeRender
  >;

  @ApiProperty()
  flag: Array<string>;

  @ApiProperty({
    type: [PermissionRender],
  })
  permission?: Array<PermissionRender>;

}
