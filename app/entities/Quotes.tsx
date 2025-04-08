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
  contactName2?: string;
  phoneNumber1?: string;
  phoneNumber2?: string;
  zipCode: string;
  state?: string;
  email?: string;
  dateStarted?: string;
  city?: string;
  freight?: number;
  installation?: number;
  rentals?: number;
  permits?: number;
  engCals?: number;
  freightMargin?: number;
  installationMargin?: number;
  rentalsMargin?: number;
  permitsMargin?: number;
  engCalsMargin?: number;
  salesTax?: number;
  materialMargin?: number;
  engCalcsSalesTaxApplicable?: boolean;
  engCalcsSalesTax?: number;
  freightSalesTaxApplicable?: boolean;
  freightSalesTax?: number;
  installationSalesTaxApplicable?: boolean;
  installationSalesTax?: number;
  materialSalesTaxApplicable?: boolean;
  materialSalesTax?: number;
  permitsSalesTaxApplicable?: boolean;
  permitsSalesTax?: number;
  rentalsSalesTaxApplicable?: boolean;
  rentalsSalesTax?: number; 
};

export enum QuotesStatus {
  New = 0,
  Revised = 1,
  Completed = 2,
}
