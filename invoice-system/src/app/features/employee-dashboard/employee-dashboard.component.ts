import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
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

@ViewChild('fakeScroll') fakeScroll!: ElementRef;
  @ViewChild('fakeContent') fakeContent!: ElementRef;
  private realWrapper!: HTMLElement | null;

  ngOnInit(): void {
    this.loadInvoices();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.realWrapper = document.querySelector('.p-datatable-wrapper, .p-datatable-table-container') as HTMLElement;

      if (this.realWrapper && this.fakeScroll) {
        this.updateFakeScrollWidth();

        this.realWrapper.addEventListener('scroll', () => {
          this.fakeScroll.nativeElement.scrollLeft = this.realWrapper!.scrollLeft;
        });
      }
    }, 100);
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

  @HostListener('window:resize')
  updateFakeScrollWidth() {
    if (this.realWrapper && this.fakeContent) {
      const tableElement = this.realWrapper.querySelector('table');
      if (tableElement) {
        this.fakeContent.nativeElement.style.width = tableElement.offsetWidth + 'px';
      }
    }
  }

  onTopScroll() {
    if (this.realWrapper && this.fakeScroll) {
      this.realWrapper.scrollLeft = this.fakeScroll.nativeElement.scrollLeft;
    }
  }

}
