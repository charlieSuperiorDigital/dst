type Bay = {
  id: string;
  name: string;
};
type Flue = {
  id: string;
  name: string;
};
type Frameline = {
  id: string;
  name: string;
};
export type Row = {
  id: string;
  name: string;
  quotationId: string;
};

type BayWithQuantity = {
  bay: Bay;
  quantity: number;
};
type fluesWithQuantity = {
  flue: Flue;
  quantity: number;
};
type framelinesWithQuantity = {
  frameline: Frameline;
  quantity: number;
};

export type RowWithDetails = {
  row: Row[];
  bays?: BayWithQuantity[];
  flues?: fluesWithQuantity[];
  framelines?: framelinesWithQuantity[];
};

type Part = {
  unitWeight: number;
  unitMatLb: number;
  unitLabor: number;
  unitCost: number;
  unitSell: number;
  laborEA: number;
  id: string;
  description: string;
  color: string | null;
  colorId: number;
  partNumber: string;
  quotationId: string;
};

export type QuoteData = {
  rows: RowWithDetails[];
  parts: Part[];
};
