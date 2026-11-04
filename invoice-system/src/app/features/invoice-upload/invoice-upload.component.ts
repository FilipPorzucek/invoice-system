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
import { InvoiceService } from '../../core/services/invoice.service';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  bankAccountValidator,
  currencyValidator,
  grossNotLowerThanNetValidator,
  invoiceNumberValidator,
  issueDateValidator,
  nipValidator,
  positiveNumberValidator
} from '../../core/validators/invoice.validators';
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
    DialogModule,
  CalendarModule,
    TranslatePipe],
  templateUrl: './invoice-upload.component.html',
  styleUrl: './invoice-upload.component.scss'
})
export class InvoiceUploadComponent {
  private fb=inject(FormBuilder);
  private invoiceService=inject(InvoiceService);
  private router = inject(Router);
  

  invoiceForm:FormGroup;

  selectedFile: File | null = null;
  pdfPreviewUrl: string | null = null;
  isProcessing: boolean = false;
  isOcrDone: boolean = false;
  showSuccessDialog: boolean=false;
  showErrorDialog: boolean=false;
  isSubmitting: boolean=false;
  showOcrTimeoutDialog: boolean=false;
  currentInvoiceId: number | null = null;
  pollingInterval: any;

  constructor(){
    this.invoiceForm = this.fb.group({
      invoiceNumber: [{ value: '', disabled: true }, [Validators.required, invoiceNumberValidator]],
      issueDate: [{ value: '', disabled: true }, [Validators.required, issueDateValidator]],
      currency: [{ value: 'PLN', disabled: true }, [Validators.required, currencyValidator]],
      netAmount: [{ value: '', disabled: true }, [Validators.required, Validators.min(0)]],
      grossAmount: [{ value: '', disabled: true }, [Validators.required, Validators.min(0)]],
      minioFilePath:[''],

      supplier: this.fb.group({
        nip: [{ value: '', disabled: true }, [Validators.required, nipValidator]],
        name: [{ value: '', disabled: true }, Validators.required],
        address: [{ value: '', disabled: true }, Validators.required],
        bankAccountNumber: [{ value: '', disabled: true }, [Validators.required, bankAccountValidator]]
      }),

      items: this.fb.array([])
    }, { validators: grossNotLowerThanNetValidator });
    this.items.push(this.createItemFormGroup('',0,0,0,0))
  }

  get items(){
    return this.invoiceForm.get('items') as FormArray;
  }

  createItemFormGroup(name: string, quantity: number, netPrice: number,netValue:number, taxRate: number): FormGroup {
    const isDisabled=!this.isOcrDone;
    return this.fb.group({
      name: [{ value: name, disabled: isDisabled }, Validators.required],
      quantity: [{ value: quantity, disabled: isDisabled }, [Validators.required, positiveNumberValidator]],
      netPrice: [{ value: netPrice, disabled: isDisabled }, [Validators.required, Validators.min(0)]],
      netValue: [{ value: netValue, disabled: isDisabled }, [Validators.required, Validators.min(0)]],
      taxRate: [{ value: taxRate, disabled: isDisabled }, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  hasError(path: string): boolean {
    const control = this.invoiceForm.get(path);
    return !!control && control.enabled && control.invalid && (control.touched || control.dirty);
  }

  hasItemError(index: number, field: string): boolean {
    return this.hasError(`items.${index}.${field}`);
  }

  errorKey(path: string): string {
    const errors = this.invoiceForm.get(path)?.errors;
    if (!errors) {
      return '';
    }
    const messages: Record<string, string> = {
      required: 'invoiceUpload.walidacja.poleWymagane',
      invoiceNumberFormat: 'invoiceUpload.walidacja.numerFakturyFormat',
      invalidDate: 'invoiceUpload.walidacja.nieprawidlowaData',
      futureDate: 'invoiceUpload.walidacja.dataZPrzyszlosci',
      currencyFormat: 'invoiceUpload.walidacja.walutaFormat',
      nipFormat: 'invoiceUpload.walidacja.nipFormat',
      bankAccountFormat: 'invoiceUpload.walidacja.numerKontaFormat',
      positiveNumber: 'invoiceUpload.walidacja.wiekszeOdZera',
      min: 'invoiceUpload.walidacja.nieMozeBycUjemne',
      max: 'invoiceUpload.walidacja.vatZakres'
    };
    const firstError = Object.keys(errors)[0];
    return messages[firstError] ?? 'invoiceUpload.walidacja.nieprawidlowaWartosc';
  }

  get showGrossError(): boolean {
    return !!this.invoiceForm.errors?.['grossLowerThanNet']
      && !!(this.invoiceForm.get('grossAmount')?.touched || this.invoiceForm.get('grossAmount')?.dirty);
  }

  addItem(): void {
    this.items.push(this.createItemFormGroup('', 1, 0, 23,0));
  }

onFileSelect(event: any) {
  this.revokePdfPreview();
    this.selectedFile = event.files[0];
    if (this.selectedFile) {
      this.pdfPreviewUrl = URL.createObjectURL(this.selectedFile);
      this.processRealOcr(this.selectedFile);
    }
  }

 processRealOcr(file: File) {
    this.isProcessing = true; 

    this.invoiceService.uploadInvoiceFile(file).subscribe({
      next: (invoiceId: number) => {
        this.currentInvoiceId = invoiceId;
        this.startPollingForOcrData(invoiceId); 
      },
      error: (error) => {
        this.isProcessing = false;
        this.isOcrDone = true;           
        this.invoiceForm.enable();       
        console.error('Błąd podczas wgrywania pliku (np. MinIO nie odpowiada):', error);
        this.showOcrTimeoutDialog = true; 
      }
    });
  }

  startPollingForOcrData(id: number) {
    const maxPollingTime = 60000; 
    const startTime = Date.now();
    this.stopPolling();
    this.pollingInterval = setInterval(() => {

      if (Date.now() - startTime > maxPollingTime) {
        clearInterval(this.pollingInterval); 
        this.isProcessing = false; 
        this.isOcrDone=true;
        this.invoiceForm.enable(); 
        this.showOcrTimeoutDialog = true; 
        return; 
      }
      
      this.invoiceService.getInvoiceById(id).subscribe({
        next: (ocrResponse: any) => {
          
          if (ocrResponse.invoiceNumber) { 
            clearInterval(this.pollingInterval); 
            
            this.isProcessing = false;
            this.isOcrDone = true;
            this.invoiceForm.enable(); 

            this.invoiceForm.patchValue({
              invoiceNumber: ocrResponse.invoiceNumber,
              issueDate: ocrResponse.issueDate,
              currency: ocrResponse.currency || 'PLN',
              netAmount: ocrResponse.netAmount,
              grossAmount: ocrResponse.grossAmount,
              minioFilePath: ocrResponse.minioFilePath,

              supplier: {
                nip: ocrResponse.supplier?.nip,
                name: ocrResponse.supplier?.name,
                address: ocrResponse.supplier?.address,
                bankAccountNumber: ocrResponse.supplier?.bankAccountNumber
              }
            });

            this.items.clear();
            if (ocrResponse.items && ocrResponse.items.length > 0) {
              ocrResponse.items.forEach((item: any) => {
                this.items.push(this.createItemFormGroup(
                  item.name, item.quantity, item.netPrice,item.netValue, item.taxRate
                ));
              });
            } else {
              this.items.push(this.createItemFormGroup('', 0, 0, 0,0));
            }
            this.invoiceForm.enable();
            this.invoiceForm.markAllAsTouched();
          }
        },
        error: (error) => {
          clearInterval(this.pollingInterval);
          this.isProcessing = false;
          this.invoiceForm.enable();
          console.error('Błąd podczas odpytywania o dane OCR:', error);
          this.isOcrDone = true;
          this.showOcrTimeoutDialog = true;
        }
      });

    }, 3000); 
  }

onSubmit() {
  if (this.invoiceForm.valid && !this.isSubmitting && this.currentInvoiceId) {
    this.isSubmitting = true;
    const invoiceData = this.invoiceForm.getRawValue();

    this.invoiceService.submitInvoiceByEmployee(this.currentInvoiceId, invoiceData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showSuccessDialog = true;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Błąd podczas przesyłania faktury do księgowości:', error);
        this.showErrorDialog = true;
      }
    });
  }
}

closeErrorDialog() {
    this.showErrorDialog = false;
  }

closeSuccessDialog() {
    this.showSuccessDialog = false;
    
    this.invoiceForm.reset({ currency: 'PLN' });
    this.items.clear();
    this.isOcrDone = false;
    this.items.push(this.createItemFormGroup('', 0, 0, 0,0));
    this.invoiceForm.disable();

    this.selectedFile = null;
    this.revokePdfPreview();

    if (this.currentInvoiceId) {
    this.router.navigate(['/employee/invoice', this.currentInvoiceId]);
  }
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private revokePdfPreview(): void {
    if (this.pdfPreviewUrl) {
      URL.revokeObjectURL(this.pdfPreviewUrl);
      this.pdfPreviewUrl = null;
    }
  }

}
