import { GroupEntity } from '../model/group/group.entity';

class GroupAttributeRender {

  attribute: string;
  string: string;
  lang: string;

}

export class GroupRender {

  constructor(item: GroupEntity) {
    this.id = item.id;
    this.created_at = item.created_at.toISOString();
    this.updated_at = item.updated_at.toISOString();
    this.version = item.version;
    this.parent = item.parent?.id;
    this.attribute = [
      ...item.string.map(str => ({
        string: str.string,
        attribute: str.attribute.id,
        lang: str.lang?.id,
      })),
    ];
    this.flag = item.flag.map(fl => fl.flag.id);
  }

  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  parent?: string;
  attribute: GroupAttributeRender[];
  flag: string[];

}