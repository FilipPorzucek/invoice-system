import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PdfViewerModule } from 'ng2-pdf-viewer'; 
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { InputTextarea } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';

@Component({
  selector: 'app-accountant-invoice-view',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, CardModule, 
    InputTextModule, ButtonModule, DividerModule, PdfViewerModule, 
    DialogModule, CalendarModule, InputTextarea
  ],
  templateUrl: './accountant-invoice-view.component.html',
  styleUrl: './accountant-invoice-view.component.scss'
})
export class AccountantInvoiceViewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  invoiceForm: FormGroup;
  invoiceId!: number;
  pdfPreviewUrl: string | null = null;
  isSubmitting: boolean = false;

  showRejectDialog: boolean = false;
  rejectReason: string = '';

  constructor() {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      issueDate: ['', Validators.required],
      currency: ['PLN', Validators.required],
      netAmount: ['', Validators.required],
      grossAmount: ['', Validators.required],
      minioFilePath: [''],

      supplier: this.fb.group({
        nip: ['', Validators.required],
        name: ['', Validators.required],
        address: ['', Validators.required],
        bankAccountNumber: ['', Validators.required]
      }),

      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.invoiceId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.invoiceId) {
      this.loadInvoiceData();
    }
  }

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemFormGroup(name: string, quantity: number, netPrice: number, taxRate: number): FormGroup {
    return this.fb.group({
      name: [name, Validators.required],
      quantity: [quantity, Validators.required],
      netPrice: [netPrice, Validators.required],
      taxRate: [taxRate, Validators.required]
    });
  }

  loadInvoiceData() {
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (data: any) => {
        this.invoiceForm.patchValue({
          invoiceNumber: data.invoiceNumber,
          issueDate: data.issueDate,
          currency: data.currency || 'PLN',
          netAmount: data.netAmount,
          grossAmount: data.grossAmount,
          minioFilePath: data.minioFilePath,
          supplier: {
            nip: data.supplier?.nip,
            name: data.supplier?.name,
            address: data.supplier?.address,
            bankAccountNumber: data.supplier?.bankAccountNumber
          }
        });

        this.items.clear();
        if (data.items && data.items.length > 0) {
          data.items.forEach((item: any) => {
            this.items.push(this.createItemFormGroup(
              item.name, item.quantity, item.netPrice, item.taxRate
            ));
          });
        }

        this.invoiceService.downloadInvoiceFile(this.invoiceId).subscribe({
        next: (blob: Blob) => {
          this.pdfPreviewUrl = URL.createObjectURL(blob);
        },
        error: (err) => console.error('Błąd pobierania pliku PDF z backendu:', err)
      });
      },
      error: (err) => console.error('Błąd pobierania faktury:', err)
    });
  }

  onApprove() {
    if (this.invoiceForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const invoiceData = this.invoiceForm.getRawValue();

      this.invoiceService.approveInvoice(this.invoiceId, invoiceData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/accountant/dashboard']);
        },
        error: (err) => {
          console.error('Błąd zatwierdzania:', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  openRejectDialog() {
    this.showRejectDialog = true;
  }

  onReject() {
    if (!this.rejectReason.trim()) return;

    console.log('Faktura odrzucona. Powód:', this.rejectReason);
    this.showRejectDialog = false;
    this.router.navigate(['/accountant/dashboard']);
  }

  goBack() {
    this.router.navigate(['/accountant/dashboard']);
  }
}