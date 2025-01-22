export type Quotes = {
  id: number;
  name: string;
  creationDate: string;
  updateDate: string;
  status?: QuotesStatus;
  responsible?: string;
  customerName?: string;
  address?: string;
  contactName?: string;
  phoneNumber1?: string;
  phoneNumber2?: string;
  zipCode: string;
  state?: string;
  email?: string;
  dateStarted?: string;
};

export enum QuotesStatus {
  New = 0,
  Revised = 1,
  Completed = 2,
}
