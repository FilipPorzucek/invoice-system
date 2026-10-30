import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invoice } from '../model/invoice.model';
import { InvoiceReportFilters, InvoiceReportResponse } from '../model/InvoiceReportFilters.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private http=inject(HttpClient);

  private apiUrl="http://localhost:8081/api/invoices";
  private ocrPodApiUrl = 'http://localhost:8000/api/v1/pod';
  private readonly reportsApiUrl = 'http://localhost:8000/api/v1/reports/invoices';
  private readonly minioBaseUrl = 'http://localhost:9000';

  getEmployeeInvoices():Observable<Invoice[]>{
    return this.http.get<Invoice[]>(`${this.apiUrl}/new`)
  }

  uploadInvoiceFile(file: File): Observable<number> {
    const formData = new FormData();
    formData.append('file', file); 
    return this.http.post<number>(`${this.apiUrl}/upload`, formData);
  }

  getInvoiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  approveInvoice(id: number, invoiceData: any): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, invoiceData, { responseType: 'text' });
  }

  getPendingInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/pending`);
  }

  downloadInvoiceFile(invoiceId: number) {
  return this.http.get(`http://localhost:8081/api/invoices/${invoiceId}/file`, {
    responseType: 'blob'
  });
}

rejectInvoice(id: number, reason: string): Observable<string> {
  return this.http.put(`http://localhost:8081/api/invoices/${id}/reject`, { reason }, { responseType: 'text' });
}

submitInvoiceByEmployee(id: number, invoiceData: any): Observable<string> {
  return this.http.put(`${this.apiUrl}/${id}/submit`, invoiceData, { responseType: 'text' });
}

getManagerInvoices(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/manager/pending`);
}

approveInvoiceByManager(id: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}/manager-approve`, {}, {responseType:'text'});
}

getOcrPodStatus(): Observable<any> {
    return this.http.get<any>(`${this.ocrPodApiUrl}/status`);
  }

  startOcrPod(): Observable<any> {
    return this.http.post<any>(`${this.ocrPodApiUrl}/start`, {});
  }

  stopOcrPod(): Observable<any> {
    return this.http.post<any>(`${this.ocrPodApiUrl}/stop`, {});
  }

  generateInvoicesReport(filters: InvoiceReportFilters): Observable<InvoiceReportResponse> {
    return this.http.post<InvoiceReportResponse>(this.reportsApiUrl, filters);
  }

  downloadReport(filePath: string): void {
    const downloadUrl = `${this.minioBaseUrl}/reports/${filePath}`;
    const fileName = filePath.split('/').pop() || 'raport_faktur.xlsx';

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getSuppliers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/suppliers`);
}
  
}
