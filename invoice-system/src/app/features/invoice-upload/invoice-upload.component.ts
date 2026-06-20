import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { PdfViewerModule } from 'ng2-pdf-viewer'; 
import { InvoiceService } from '../../core/invoice.service';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-invoice-upload',
  imports: [CommonModule,
    ReactiveFormsModule,
    FileUploadModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule,
    DividerModule,
    PdfViewerModule,
    DialogModule],
  templateUrl: './invoice-upload.component.html',
  styleUrl: './invoice-upload.component.scss'
})
export class InvoiceUploadComponent {
  private fb=inject(FormBuilder);
  private InvoiceService=inject(InvoiceService);
  

  invoiceForm:FormGroup;

  selectedFile: File | null = null;
  pdfPreviewUrl: string | null = null;
  isProcessing: boolean = false;
  isOcrDone: boolean = false;
  showSuccessDialog: boolean=false;

  constructor(){
    this.invoiceForm = this.fb.group({
      invoiceNumber: [{ value: '', disabled: true }, Validators.required],
      issueDate: [{ value: '', disabled: true }, Validators.required],
      currency: [{ value: 'PLN', disabled: true }, Validators.required],
      netAmount: [{ value: '', disabled: true }, Validators.required],
      grossAmount: [{ value: '', disabled: true }, Validators.required],
      minioFilePath:[''],

      supplier: this.fb.group({
        nip: [{ value: '', disabled: true }, Validators.required],
        name: [{ value: '', disabled: true }, Validators.required],
        address: [{ value: '', disabled: true }, Validators.required],
        bankAccountNumber: [{ value: '', disabled: true }, Validators.required]
      }),

      items: this.fb.array([])
    });
    this.items.push(this.createItemFormGroup('',0,0,0))
  }

  get items(){
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemFormGroup(name: string, quantity: number, netPrice: number, taxRate: number): FormGroup {
    return this.fb.group({
      name: [{ value: name, disabled: true }, Validators.required],
      quantity: [{ value: quantity, disabled: true }, Validators.required],
      netPrice: [{ value: netPrice, disabled: true }, Validators.required],
      taxRate: [{ value: taxRate, disabled: true }, Validators.required]
    });
  }

  onFileSelect(event:any){
    this.selectedFile=event.files[0];
    if(this.selectedFile){
      const objectUrl=URL.createObjectURL(this.selectedFile);
      this.pdfPreviewUrl = URL.createObjectURL(this.selectedFile);
      this.processOcrMock();
    }

  }

  processOcrMock() {
    this.isProcessing = true;

    setTimeout(() => {
      this.isProcessing = false;
      this.isOcrDone = true;

      this.invoiceForm.enable();

      this.invoiceForm.patchValue({
        invoiceNumber: 'FA/2026/06/999',
        issueDate: '2026-06-16',
        currency: 'PLN',
        netAmount: 2000.00,
        grossAmount: 2460.00,
        minioFilePath: 'faktury/2026/06/skan_999.pdf',
        supplier: {
          nip: '9876543210',
          name: 'Artykuły Biurowe Jan Kowalski',
          address: 'ul. Papierowa 3, Rzeszów',
          bankAccountNumber: 'PL123456789000000000000007'
        }
      });

      this.items.clear();
      this.items.push(this.createItemFormGroup('Audyt bezpieczeństwa', 1, 2000.00, 0.23));

    }, 3000);
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      const invoiceData = this.invoiceForm.getRawValue();
       this.InvoiceService.saveInvoiceFromOcr(invoiceData).subscribe({
        next:(response)=>{
        this.showSuccessDialog=true;
        },
        error:(error)=>{
          console.error('Błąd podczas zapisu faktury do bazy:', error);
        }
       });
    }
  }

  closeSuccessDialog(){
    this.showSuccessDialog=false;
    this.invoiceForm.reset();
    this.items.clear();
    this.items.push(this.createItemFormGroup('',0,0,0));
    this.invoiceForm.disable();

    this.selectedFile=null;
    this.pdfPreviewUrl=null;
    this.isOcrDone=false;

  }

}
