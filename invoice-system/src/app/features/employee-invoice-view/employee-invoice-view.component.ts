import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PdfViewerModule } from 'ng2-pdf-viewer'; 
import { CalendarModule } from 'primeng/calendar';
import { InvoiceService } from '../../core/services/invoice.service';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-employee-invoice-view',
    imports: [
    CommonModule, ReactiveFormsModule, FormsModule, CardModule, 
    InputTextModule, ButtonModule, DividerModule, PdfViewerModule, 
    DialogModule, CalendarModule
  ],
  templateUrl: './employee-invoice-view.component.html',
  styleUrl: './employee-invoice-view.component.scss'
})
export class EmployeeInvoiceViewComponent {
private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  invoiceForm: FormGroup;
  invoiceId!: number;
  pdfPreviewUrl: string | null = null;
  rejectionReason: string | null = null;
  invoiceStatus: string = '';
  isSubmitting: boolean=false;

  constructor() {
    this.invoiceForm = this.fb.group({
      invoiceNumber: [{value: '', disabled: true}],
      issueDate: [{value: '', disabled: true}],
      currency: [{value: 'PLN', disabled: true}],
      netAmount: [{value: '', disabled: true}],
      grossAmount: [{value: '', disabled: true}],
      
      supplier: this.fb.group({
        nip: [{value: '', disabled: true}],
        name: [{value: '', disabled: true}],
        address: [{value: '', disabled: true}],
        bankAccountNumber: [{value: '', disabled: true}]
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

  createItemFormGroup(name: string, quantity: number, netPrice: number, taxRate: number,netValue:number): FormGroup {
    return this.fb.group({
      name: [{value: name, disabled: true}],
      quantity: [{value: quantity, disabled: true}],
      netPrice: [{value: netPrice, disabled: true}],
      netValue:[{value: netValue, disabled: true}],
      taxRate: [{value: taxRate, disabled: true}]
    });
  }

  loadInvoiceData() {
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (data: any) => {
        this.rejectionReason = data.rejectionReason;
        this.invoiceStatus = data.status;

        this.invoiceForm.patchValue({
          invoiceNumber: data.invoiceNumber,
          issueDate: data.issueDate,
          currency: data.currency || 'PLN',
          netAmount: data.netAmount,
          grossAmount: data.grossAmount,
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
              item.name, item.quantity, item.netPrice,item.netValue, item.taxRate
            ));
          });
        }

        if (this.invoiceStatus === 'REJECTED') {
        this.invoiceForm.enable();
      } else {
        this.invoiceForm.disable();
      }

        this.invoiceService.downloadInvoiceFile(this.invoiceId).subscribe({
        next: (blob: Blob) => {
          this.pdfPreviewUrl = URL.createObjectURL(blob);
        },
        error: (err) => console.error('Błąd pobierania pliku PDF:', err)
      });
      },
      error: (err) => console.error('Błąd pobierania faktury:', err)
    });
  }

  goBack() {
    this.router.navigate(['/employee/dashboard']); 
  }

  onResubmit() {
  if (this.invoiceForm.valid && !this.isSubmitting) {
    this.isSubmitting = true;
    const invoiceData = this.invoiceForm.getRawValue();

    this.invoiceService.submitInvoiceByEmployee(this.invoiceId, invoiceData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/employee/dashboard']);
      },
      error: (err) => {
        console.error('Błąd ponownego wysyłania:', err);
        this.isSubmitting = false;
      }
    });
  }
}
}
