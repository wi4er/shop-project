enum OrderDirection {

  DESC = 'desc',
  ASC = 'acs',

}

export class ElementOrderSchema {

  value: OrderDirection;

  sort: OrderDirection;

}