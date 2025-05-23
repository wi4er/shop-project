
export interface AccessEntity {

  id: number;
  created_at: string;
  updated_at: string;
  version: number;

  target: string;
  method: string;
  group: string;

}
