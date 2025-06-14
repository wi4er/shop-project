import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeView } from '../../common/view/attribute/string-attribute.view';
import { PointAttributeView } from '../../common/view/attribute/point-attribute.view';
import { ElementEntity } from '../model/element/element.entity';
import { ElementAttributeView } from '../../common/view/attribute/element-attribute.view';
import { SectionAttributeView } from '../../common/view/attribute/section-attribute.view';
import { PermissionView } from '../../common/view/permission.view';
import { FileAttributeView } from '../../common/view/attribute/file-attribute.view';
import { ImageView } from '../../common/view/image.view';
import { DescriptionAttributeView } from '../../common/view/attribute/description-attribute.view';
import { IntervalAttributeView } from '../../common/view/attribute/interval-attribute.view';

@ApiExtraModels(
  StringAttributeView,
  PointAttributeView,
  ElementAttributeView,
  SectionAttributeView,
  PermissionView,
)
export class ElementView {

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
      ...item.description.map(descr => ({
        description: descr.description,
        attribute: descr.attribute.id,
        lang: descr.lang?.id,
      })),
      ...item.interval.map(int => ({
        from: int.from.toISOString(),
        to: int?.to?.toISOString() ?? null,
        attribute: int.attribute.id,
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
  image: Array<ImageView>;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {$ref: getSchemaPath(StringAttributeView)},
        {$ref: getSchemaPath(PointAttributeView)},
        {$ref: getSchemaPath(ElementAttributeView)},
        {$ref: getSchemaPath(SectionAttributeView)},
      ],
    },
  })
  attribute: Array<
    StringAttributeView
    | DescriptionAttributeView
    | IntervalAttributeView
    | PointAttributeView
    | ElementAttributeView
    | SectionAttributeView
    | FileAttributeView
  >;

  @ApiProperty()
  flag: Array<string>;

  @ApiProperty({
    type: [PermissionView],
  })
  permission?: Array<PermissionView>;

}
