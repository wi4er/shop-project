import { WithAttributeInput } from '../../common/input/with-attribute.input';
import { WithFlagInput } from '../../common/input/with-flag.input';
import { AttributeValueInput } from '../../common/input/attribute-value.input';

export class FileInput
  implements WithAttributeInput, WithFlagInput {

  original: string;
  encoding?: string;
  mimetype: string;
  collection: string;
  path: string;
  attribute: AttributeValueInput[];
  flag: string[];

}