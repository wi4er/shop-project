import { SectionEntity } from '../model/section.entity';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringPropertyRender } from '../../common/render/string-property.render';
import { PointPropertyRender } from '../../common/render/point-property.render';
import { ImageRender } from '../../common/render/image.render';
import { PermissionRender } from '../../common/render/permission.render';

@ApiExtraModels(StringPropertyRender, PointPropertyRender)
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
  block: number;

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
        {$ref: getSchemaPath(StringPropertyRender)},
        {$ref: getSchemaPath(PointPropertyRender)},
      ],
    },
  })
  property: Array<StringPropertyRender | PointPropertyRender>;

  @ApiProperty()
  flag: Array<string>;

  @ApiProperty({
    type: [PermissionRender],
  })
  permission?: Array<PermissionRender>;

}

