import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invoice } from '../model/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private http=inject(HttpClient);

  private apiUrl="http://localhost:8081/api/invoices";

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

}
