import { Color } from "./color";

export interface PartList {
  id: string;
  partNumber: string;
  qty: number;
  description: string;
  color: Color | null;
  colorId: number;
  unitWeight: number;
  unitMatLb: number;
  unitLabor: number;
  unitCost: number;
  unitSell: number;
  totalSell?: number;
  laborEA: number;
}
