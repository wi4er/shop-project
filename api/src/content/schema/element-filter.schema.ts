class ElementFlagFilterSchema {

  eq: [ string ];

}

class ElementPointFilterSchema {

  eq: [ string ];

}

class ElementStringFilterSchema {

  eq: [ string ];

}


export class ElementFilterSchema {

  block: string;

  flag?: ElementFlagFilterSchema;

  point?: { [key: string]: ElementPointFilterSchema };

  string?: ElementStringFilterSchema;

}