import { AttributeValueInput } from './attribute-value.input';
import { AttributeStringInput } from './attribute-string.input';
import { AttributePointInput } from './attribute-point.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { AttributeElementInput } from './attribute-element.input';
import { AttributeDescriptionInput } from './attribute-description.input';
import { AttributeCounterInput } from './attribute-counter.input';
import { AttributeSectionInput } from './attribute-section.input';

export type AttributePack = {

  string: Array<AttributeStringInput>;
  description: Array<AttributeDescriptionInput>;

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
    point: [],
    counter: [],
    element: [],
    section: [],
  };

  for (const item of attribute ?? []) {
    if (item['string']) pack.string.push(<AttributeStringInput>item);
    else if (item['description']) pack.description.push(<AttributeDescriptionInput>item);
    else if (item['count']) pack.counter.push(<AttributeCounterInput>item);
    else if (item['point']) pack.point.push(<AttributePointInput>item);
    else if (item['element']) pack.element.push(<AttributeElementInput>item);
    else throw new WrongDataException('Wrong attribute type!');
  }

  return pack;
}