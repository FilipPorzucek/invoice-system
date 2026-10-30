import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceReportFilters } from '../../core/model/InvoiceReportFilters.model';
import { AuthService } from '../../core/services/auth.service';

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
  private userRole: string = '';
  private currentUserId: number | null = null;

  reportForm: FormGroup;
  isLoading = false;

  constructor(
    private invoiceService:InvoiceService,
    private authService: AuthService
  ) {
    this.reportForm = this.fb.group({
      issue_date_from: [null],
      issue_date_to: [null],
      created_at_from: [null],
      created_at_to: [null],
      status_id: [null],
      supplier_id: [null],
      currency: [null],
      limit: [50000]
    });
  }

ngOnInit(): void {
    const user = this.authService.getUser();
    console.log('1. [AUTH USER]:', user);

    if (user) {
      this.userRole = user.role || '';
      // Sprawdzamy pole id oraz ewentualne alternatywne nazwy z tokena (userId)
      this.currentUserId = user.id ?? (user as any).userId ?? null;
      console.log('2. [ODCZYTANA ROLA]:', this.userRole);
      console.log('3. [ODCZYTANE ID]:', this.currentUserId);
    } else {
      console.warn('⚠️ [AUTH]: Obiekt user jest pusty (null/undefined) w ngOnInit!');
    }
  }

generateReport(): void {
    if (this.reportForm.invalid) return;

    this.isLoading = true;
    const raw = this.reportForm.value;
    const formatDate = (date: Date) => date ? this.datePipe.transform(date, 'yyyy-MM-dd') : null;

    const uploadedBy = this.userRole === 'EMPLOYEE' ? this.currentUserId : null;

    const payload: InvoiceReportFilters = {
      issue_date_from: formatDate(raw.issue_date_from),
      issue_date_to: formatDate(raw.issue_date_to),
      created_at_from: formatDate(raw.created_at_from),
      created_at_to: formatDate(raw.created_at_to),
      status_id: raw.status_id ? Number(raw.status_id) : null,
      uploaded_by: uploadedBy,
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