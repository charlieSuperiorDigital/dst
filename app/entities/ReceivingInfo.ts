import { Color } from "./color";

export interface ReceivingLoad {
  id: string;
  partId: string;
  quotationId: string;
  receivingId: string;
  quantityReceived: number;
  name: string;
}

export interface ReceivingInfo {
  partId: string;
  partNo: string;
  quotationId: string;
  receivingId: string;
  partDescription: string;
  color: Color | null;
  quantityRequired: number;
  totalQuantityReceived: number;
  balanceDue: number;
  receivingLoad: ReceivingLoad[];
} 