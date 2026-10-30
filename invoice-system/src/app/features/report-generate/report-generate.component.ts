import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceReportFilters } from '../../core/model/InvoiceReportFilters.model';

@Component({
  selector: 'app-report-generate',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    InputTextModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './report-generate.component.html',
  styleUrls: ['./report-generate.component.scss'],
  providers: [DatePipe]
})
export class ReportGenerateComponent {
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);

  reportForm: FormGroup;
  isLoading = false;

  constructor(
    private invoiceService:InvoiceService
  ) {
    this.reportForm = this.fb.group({
      issue_date_from: [null],
      issue_date_to: [null],
      created_at_from: [null],
      created_at_to: [null],
      status_id: [null],
      uploaded_by: [null],
      supplier_id: [null],
      currency: [null],
      limit: [50000]
    });
  }

generateReport(): void {
    if (this.reportForm.invalid) return;

    this.isLoading = true;
    const raw = this.reportForm.value;
    const formatDate = (date: Date) => date ? this.datePipe.transform(date, 'yyyy-MM-dd') : null;

    const payload: InvoiceReportFilters = {
      issue_date_from: formatDate(raw.issue_date_from),
      issue_date_to: formatDate(raw.issue_date_to),
      created_at_from: formatDate(raw.created_at_from),
      created_at_to: formatDate(raw.created_at_to),
      status_id: raw.status_id ? Number(raw.status_id) : null,
      uploaded_by: raw.uploaded_by ? Number(raw.uploaded_by) : null,
      supplier_id: raw.supplier_id ? Number(raw.supplier_id) : null,
      currency: raw.currency?.trim() || null,
      limit: raw.limit ? Number(raw.limit) : 50000
    };

    this.invoiceService.generateInvoicesReport(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Odpowiedź serwera raportów:', response);
        this.invoiceService.downloadReport(response.file_path);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Błąd generowania raportu:', err);
      }
    });
  }

}