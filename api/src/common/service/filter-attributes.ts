import { AttributeValueInput } from '../input/attribute/attribute-value.input';
import { AttributeStringInput } from '../input/attribute/attribute-string.input';
import { AttributePointInput } from '../input/attribute/attribute-point.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { AttributeElementInput } from '../input/attribute/attribute-element.input';
import { AttributeDescriptionInput } from '../input/attribute/attribute-description.input';
import { AttributeCounterInput } from '../input/attribute/attribute-counter.input';
import { AttributeSectionInput } from '../input/attribute/attribute-section.input';
import { AttributeIntervalInput } from '../input/attribute/attribute-interval.input';

export type AttributePack = {

  string: Array<AttributeStringInput>;
  description: Array<AttributeDescriptionInput>;
  interval: Array<AttributeIntervalInput>;

  point: Array<AttributePointInput>;
  counter: Array<AttributeCounterInput>;

  element: Array<AttributeElementInput>;
  section: Array<AttributeSectionInput>;
}

export function filterAttributes(
  attribute: AttributeValueInput[]
): AttributePack {

  const pack: AttributePack = {
    string: [],
    description: [],
    interval: [],
    point: [],
    counter: [],
    element: [],
    section: [],
  };

  for (const item of attribute ?? []) {
    if (item['string']) pack.string.push(<AttributeStringInput>item);
    else if (item['description']) pack.description.push(<AttributeDescriptionInput>item);
    else if (item['from']) pack.interval.push(<AttributeIntervalInput>item);
    else if (item['count']) pack.counter.push(<AttributeCounterInput>item);
    else if (item['point']) pack.point.push(<AttributePointInput>item);
    else if (item['element']) pack.element.push(<AttributeElementInput>item);
    else throw new WrongDataException('Wrong attribute type!');
  }

  return pack;
}