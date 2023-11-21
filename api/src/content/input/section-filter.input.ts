class SectionFlagFilterSchema {

  eq: [ string ];

}

export class SectionFilterInput {

  block?: string;

  flag?: SectionFlagFilterSchema;

}