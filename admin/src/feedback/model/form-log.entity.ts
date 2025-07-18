export interface FormLogEntity {

  version: number,

  items: Array<{
    created_at: Date;
    value: string;
    from: string;
    to: string;
  }>;

}
