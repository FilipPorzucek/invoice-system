import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Invoice } from '../../core/model/invoice.model';
import { InvoiceItem } from '../../core/model/invoice-item.model';
import { InvoiceService } from '../../core/services/invoice.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, TableModule, TagModule, InputTextModule,TranslatePipe],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.scss'
})
export class EmployeeDashboardComponent implements OnInit{
invoices: (Invoice & { statusName: string; itemsText: string })[] = [];
private invoiceService = inject(InvoiceService);
  private router = inject(Router);

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
      next: (data) => {
        console.log('2. Mamy to! Backend zwrócił:', data);
        this.invoices = data.map(invoice => ({
          ...invoice,
          statusName: this.getStatusName(invoice.status),
          itemsText: (invoice.items || []).map(item => item.name).join(', ')
        }));
      },
      error: (err) => {
        console.error("Błąd z pobraniem faktur", err);
      }
    });
  }

  getStatusName(status?: string): string {
    if (!status) {
      return "Brak statusu";
    }

    const translations: Record<string, string> = {
      'PENDING_ACCOUNTANT': 'Oczekuje na księgową',
      'PENDING_MANAGER': 'Oczekuje na menadżera',
      'REJECTED': 'Odrzucona',
      'BOOKED': 'Zaksięgowana'
    }

    return translations[status] || status;
  }

  viewInvoice(id: number | string) {
    if (id) {
      this.router.navigate(['/employee/invoice', id]);
    }
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

  this.router.navigate(['/employee/invoice', targetId]);
}

}