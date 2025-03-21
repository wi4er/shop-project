
class ElementFlagFilter {

  eq: [ string ];

}

class ElementPointFilter {

  eq: [ string ];

}

class ElementStringFilter {

  eq: [ string ];

}


export class ElementFilterInput {

  block: string;

  flag?: ElementFlagFilter;

  point?: { [key: string]: ElementPointFilter };

  string?: ElementStringFilter;

}