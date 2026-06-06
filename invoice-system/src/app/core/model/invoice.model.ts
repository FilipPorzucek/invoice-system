import { Supplier } from "./supplier.model";
import { InvoiceItem } from "./invoice-item.model";

export interface Invoice {
  invoiceNumber: string;
  grossAmount: number;
  netAmount: number;
  minioFilePath: string;
  
  supplier?: Supplier;
  items?: InvoiceItem[];

  id?: number;
  issueDate?: string; 
  currency?: string;
  status?: string;
}