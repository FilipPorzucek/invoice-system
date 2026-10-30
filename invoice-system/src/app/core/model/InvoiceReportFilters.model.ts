export interface InvoiceReportFilters {
  issue_date_from?: string | null;
  issue_date_to?: string | null;
  created_at_from?: string | null;
  created_at_to?: string | null;
  status_id?: number | null;
  uploaded_by?: number | null;
  supplier_id?: number | null;
  currency?: string | null;
  limit?: number;
}

export interface InvoiceReportResponse {
  file_path: string;
}