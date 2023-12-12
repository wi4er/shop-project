import { PropertyValueInput } from './property-value.input';
import { PropertyStringInput } from './property-string.input';
import { PropertyPointInput } from './property-point.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';
import { PropertyElementInput } from './property-element.input';

export function filterProperties(property: PropertyValueInput[]): [PropertyStringInput[], PropertyPointInput[], PropertyElementInput[]] {
  const stringList: PropertyStringInput[] = [];
  const pointList: PropertyPointInput[] = [];
  const elementList: PropertyElementInput[] = [];

  for (const item of property ?? []) {
    if (item['string']) stringList.push(<PropertyStringInput>item);
    else if (item['point']) pointList.push(<PropertyPointInput>item);
    else if (item['element']) elementList.push(<PropertyElementInput>item);
    else throw new WrongDataException('Wrong property type!');
  }

  return [stringList, pointList, elementList];
}