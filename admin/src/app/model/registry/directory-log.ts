
export interface DirectoryLog {

  id: number;
  created_at: Date;

  directory: string;
  field: string;
  operation: string;
  from: string;
  to: string;

}
