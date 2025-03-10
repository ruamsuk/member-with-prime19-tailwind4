export interface Account {
  id?: string;
  date?: Date;
  details: string;
  amount: number;
  create?: Date;
  modify?: Date;
  isInCome: boolean;
  remark?: string;
}
