import { SectionEntity } from '../model/section.entity';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { StringPropertyRender } from '../../common/render/string-property.render';
import { PointPropertyRender } from '../../common/render/point-property.render';

@ApiExtraModels(StringPropertyRender, PointPropertyRender)
export class SectionRender {

  constructor(item: SectionEntity) {
    this.id = item.id;
    this.block = item.block.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;
    this.parent = item.parent?.id;
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
  parent: number;

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

}

