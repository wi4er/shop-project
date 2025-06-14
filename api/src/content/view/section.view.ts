import { SectionEntity } from '../model/section/section.entity';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeView } from '../../common/view/attribute/string-attribute.view';
import { PointAttributeView } from '../../common/view/attribute/point-attribute.view';
import { ImageView } from '../../common/view/image.view';
import { PermissionView } from '../../common/view/permission.view';

@ApiExtraModels(StringAttributeView, PointAttributeView)
export class SectionView {

  constructor(item: SectionEntity) {
    this.id = item.id;
    this.block = item.block.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;
    this.sort = item.sort;
    this.parent = item.parent?.id;
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
  parent: string;

  @ApiProperty()
  sort: number;

  @ApiProperty()
  image: Array<ImageView>;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {$ref: getSchemaPath(StringAttributeView)},
        {$ref: getSchemaPath(PointAttributeView)},
      ],
    },
  })
  attribute: Array<StringAttributeView | PointAttributeView>;

  @ApiProperty()
  flag: Array<string>;

  @ApiProperty({
    type: [PermissionView],
  })
  permission?: Array<PermissionView>;

}

