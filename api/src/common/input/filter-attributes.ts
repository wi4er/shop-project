import { AttributeValueInput } from './attribute-value.input';
import { AttributeStringInput } from './attribute-string.input';
import { PropertyPointInput } from './property-point.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { PropertyElementInput } from './property-element.input';

export function filterAttributes(
  attribute: AttributeValueInput[]
): [AttributeStringInput[], PropertyPointInput[], PropertyElementInput[]] {
  const stringList: AttributeStringInput[] = [];
  const pointList: PropertyPointInput[] = [];
  const elementList: PropertyElementInput[] = [];

  for (const item of attribute ?? []) {
    if (item['string']) stringList.push(<AttributeStringInput>item);
    else if (item['point']) pointList.push(<PropertyPointInput>item);
    else if (item['element']) elementList.push(<PropertyElementInput>item);
    else throw new WrongDataException('Wrong attribute type!');
  }

  return [stringList, pointList, elementList];
}