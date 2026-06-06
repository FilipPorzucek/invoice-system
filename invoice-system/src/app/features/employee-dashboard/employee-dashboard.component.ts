import { Component, inject, OnInit } from '@angular/core';
import { Invoice } from '../../core/model/invoice.model';
import { InvoiceItem } from '../../core/model/invoice-item.model';
import { InvoiceService } from '../../core/invoice.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, TableModule, TagModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent implements OnInit{
invoices:Invoice[]=[];
private invoiceService = inject(InvoiceService);

  ngOnInit(): void {
    this.loadInvoices();
  }
  loadInvoices() {
    this.invoiceService.getEmployeeInvoices().subscribe({
      next:(data)=>{
        console.log('2. Mamy to! Backend zwrócił:', data);
        this.invoices = data;
      },
      error:(err)=>{
        console.error("Bład z pobranie faktur",err)
      }
    })
    
  }


  getStatusName(status?:string):string{
    if(!status){
      return "Brak statusu"
    };

    const transaltions: Record<string,string>={
      'PENDING_ACCOUNTANT': 'Oczekuje na księgową',
      'PENDING_MANAGER': 'Oczekuje na menadżera',
      'REJECTED': 'Odrzucona',
      'BOOKED': 'Zaksięgowana'
    }

    return transaltions[status] || status

  }

}
