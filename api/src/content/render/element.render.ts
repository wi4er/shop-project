import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringPropertyRender } from '../../common/render/string-property.render';
import { PointPropertyRender } from '../../common/render/point-property.render';
import { ElementEntity } from '../model/element.entity';
import { ElementPropertyRender } from '../../common/render/element-property.render';
import { SectionPropertyRender } from '../../common/render/section-property.render';
import { PermissionRender } from '../../common/render/permission.render';
import { FilePropertyRender } from '../../common/render/file-property.render';
import { ImageRender } from '../../common/render/image.render';

@ApiExtraModels(
  StringPropertyRender,
  PointPropertyRender,
  ElementPropertyRender,
  SectionPropertyRender,
  PermissionRender,
)
export class ElementRender {

  constructor(item: ElementEntity) {
    this.id = item.id;
    this.block = item.block.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;
    this.section = item.parent.map(it => it.section.id);
    this.image = item.image.map(it => ({
      image: it.image.id,
      collection: it.image.collection.id,
    }));
    this.property = [
      ...item.string.map(str => ({
        string: str.string,
        property: str.property.id,
        lang: str.lang?.id,
      })),
      ...item.point.map(val => ({
        property: val.property.id,
        point: val.point.id,
        directory: val.point.directory.id,
      })),
      ...item.element.map(val => ({
        property: val.property.id,
        element: val.element.id,
      })),
      ...item.section.map(val => ({
        property: val.property.id,
        section: val.section.id,
      })),
      ...item.file.map(val => ({
        property: val.property.id,
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
  id: number;

  @ApiProperty({
    description: 'Id from content block',
  })
  block: number;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  section: Array<number>;

  @ApiProperty()
  image: Array<ImageRender>;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {$ref: getSchemaPath(StringPropertyRender)},
        {$ref: getSchemaPath(PointPropertyRender)},
        {$ref: getSchemaPath(ElementPropertyRender)},
        {$ref: getSchemaPath(SectionPropertyRender)},
      ],
    },
  })
  property: Array<
    StringPropertyRender
    | PointPropertyRender
    | ElementPropertyRender
    | SectionPropertyRender
    | FilePropertyRender
  >;

  @ApiProperty()
  flag: Array<string>;

  @ApiProperty({
    type: [PermissionRender],
  })
  permission?: Array<PermissionRender>;

}
