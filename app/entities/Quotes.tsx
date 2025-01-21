export type Quotes = {
  id: number;
  name: string;
  creationDate: string;
  updateDate: string;
  status?: QuotesStatus;
};

export enum QuotesStatus {
  New = 0,
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
  Executed = 5,
}
