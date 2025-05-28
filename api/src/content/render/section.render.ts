import { SectionEntity } from '../model/section/section.entity';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringAttributeRender } from '../../common/render/string-attribute.render';
import { PointAttributeRender } from '../../common/render/point-attribute.render';
import { ImageRender } from '../../common/render/image.render';
import { PermissionRender } from '../../common/render/permission.render';

@ApiExtraModels(StringAttributeRender, PointAttributeRender)
export class SectionRender {

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
  image: Array<ImageRender>;

  @ApiProperty({
    type: 'array',
    items: {
      oneOf: [
        {$ref: getSchemaPath(StringAttributeRender)},
        {$ref: getSchemaPath(PointAttributeRender)},
      ],
    },
  })
  attribute: Array<StringAttributeRender | PointAttributeRender>;

  @ApiProperty()
  flag: Array<string>;

  @ApiProperty({
    type: [PermissionRender],
  })
  permission?: Array<PermissionRender>;

}

