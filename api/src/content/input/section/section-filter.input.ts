import { ApiProperty } from '@nestjs/swagger';

class SectionFlagFilterSchema {

  eq: [ string ];

}

export class SectionFilterInput {

  @ApiProperty({
    name: "filter[block]",
    description: 'Filter by content block',
    required: false,
  })
  block?: string;

  flag?: SectionFlagFilterSchema;

}