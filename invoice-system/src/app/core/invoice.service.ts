import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Invoice } from './model/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private http=inject(HttpClient);

  private apiUrl="http://localhost:8081/api/invoices";

  getEmployeeInvoices():Observable<Invoice[]>{
    return this.http.get<Invoice[]>(`${this.apiUrl}/new`)
  }
}
