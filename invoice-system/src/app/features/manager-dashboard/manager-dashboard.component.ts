import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';
import { InvoiceService } from '../../core/services/invoice.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss'
})
export class ManagerDashboardComponent implements OnInit {
  invoices: any[] = [];
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getManagerInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
      },
      error: (err) => console.error('Błąd pobierania faktur menadżera:', err)
    });
  }

  onRowSelect(event: any) {
    const targetId = event.data.id || event.data.invoiceId;
    
    if (!targetId) {
      console.error("Błąd: Ten wiersz nie posiada żadnego przypisanego ID!");
      return;
    }

    // Kierujemy do widoku detali faktury menadżera (zrobimy go w następnym kroku)
    this.router.navigate(['/manager/invoice', targetId]);
  }

  get invoiceCount(): number {
    return this.invoices.length;
  }

  get totalGrossAmount(): string {
    const total = this.invoices.reduce((sum, invoice) => sum + (Number(invoice.grossAmount) || 0), 0);
    return this.formatAmount(total);
  }

  get highestGrossAmount(): string {
    const highest = this.invoices.reduce((max, invoice) => Math.max(max, Number(invoice.grossAmount) || 0), 0);
    return this.formatAmount(highest);
  }

  private formatAmount(value: number): string {
    return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
  }

  getStatusName(status: string): string {
    if (status === 'PENDING_MANAGER') return 'Oczekuje na akceptację';
    return status;
  }
}
