import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Invoice } from '../../core/model/invoice.model';
import { InvoiceService } from '../../core/services/invoice.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { Table } from 'primeng/table';
import { FilterService } from 'primeng/api';
import { DATE_RANGE_FILTER, DateRange, registerDateRangeFilter } from '../../core/utils/date-range-filter.utils';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, TableModule, TagModule, InputTextModule, TranslatePipe, FormsModule, DatePickerModule],
  templateUrl: './accountant-dasboard.component.html',
  styleUrl: './accountant-dasboard.component.scss'
})
export class AccountantDasboardComponent {
invoices: (Invoice & { statusName: string; itemsText: string })[] = [];
private invoiceService = inject(InvoiceService);
private router = inject(Router);
private filterService = inject(FilterService);

dateRange: DateRange = { from: null, to: null };

@ViewChild('fakeScroll') fakeScroll!: ElementRef;
  @ViewChild('fakeContent') fakeContent!: ElementRef;
  private realWrapper!: HTMLElement | null;

  ngOnInit(): void {
    registerDateRangeFilter(this.filterService);
    this.loadInvoices();
  }

  applyDateFilter(table: Table): void {
    table.filter({ ...this.dateRange }, 'issueDate', DATE_RANGE_FILTER);
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
    this.invoiceService.getPendingInvoices().subscribe({
      next:(data)=>{
        console.log('Mamy to! Backend zwrócił:', data);
        this.invoices = data.map(invoice => ({
          ...invoice,
          statusName: this.getStatusName(invoice.status),
          itemsText: (invoice.items || []).map(item => item.name).join(', ')
        }));
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

onRowSelect(event: any) {
    console.log("Kliknięto wiersz, pełne dane:", event.data);
    
  
    const targetId = event.data.id || event.data.invoiceId;
    
    if (!targetId) {
      console.error("Błąd: Ten wiersz nie posiada żadnego przypisanego ID!");
      return;
    }

    this.router.navigate(['/accountant/invoice', targetId]);
  }
}
