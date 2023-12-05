import { PropertyValueInput } from './property-value.input';
import { PropertyStringInput } from './property-string.input';
import { PropertyPointInput } from './property-point.input';
import { WrongDataException } from '../../exception/wrong-data/wrong-data.exception';

export function filterProperties(property: PropertyValueInput[]): [PropertyStringInput[], PropertyPointInput[]] {
  const stringList: PropertyStringInput[] = [];
  const pointList: PropertyPointInput[] = [];

  for (const item of property ?? []) {
    if (item['string']) stringList.push(<PropertyStringInput>item);
    else if (item['point']) pointList.push(<PropertyPointInput>item);
    else throw new WrongDataException('Wrong property type!');
  }

  return [stringList, pointList];
}