import { UserPropertySchema } from "./user-property.schema";

export class UserGroupSchema  {

  id: number;

  created_at: string;

  updated_at: string;

  version: number;

  parent: UserGroupSchema;

  children: UserGroupSchema[];

  property: UserPropertySchema[];

  flag: string[];

}