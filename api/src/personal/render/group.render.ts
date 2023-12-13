import { GroupEntity } from '../model/group.entity';

class GroupPropertyRender {

  property: string;
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
    this.property = [
      ...item.string.map(str => ({
        string: str.string,
        property: str.property.id,
        lang: str.lang?.id,
      })),
    ];
    this.flag = item.flag.map(fl => fl.flag.id);
  }

  id: number;
  created_at: string;
  updated_at: string;
  version: number;
  parent?: number;
  property: GroupPropertyRender[];
  flag: string[];

}