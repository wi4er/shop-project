export class AccessInput {

  id: number;

  target: string;
  group: Array<{
    group: string;
    method: string;
  }>;

}