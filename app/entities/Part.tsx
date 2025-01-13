import { Color } from "./color";

export interface Part {
  id: number;
  color: Color;
  description: string;
  colorId: number;
  laborEA: number;
  unitCost: number;
  unitLabor: number;
  unitMatLb: number;
  unitSell: number;
  unitWeight: number;
}
