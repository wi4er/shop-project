import { UserPropertySchema } from "./user-property.schema";
import { UserContactType } from "../model/user-contact.entity";

export class UserContactSchema {

  id: string;

  type: UserContactType;

  created_at: string;

  updated_at: string;

  version: number;

  propertyItem: UserPropertySchema;

  flag: string[];

}