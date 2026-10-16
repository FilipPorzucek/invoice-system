import { Component, inject } from '@angular/core';
import { InvoiceService } from '../../core/services/invoice.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-admin-ocr-settings',
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TagModule,ToastModule],
  providers: [MessageService],
  templateUrl: './admin-ocr-settings.component.html',
  styleUrl: './admin-ocr-settings.component.scss'
})
export class AdminOcrSettingsComponent {
  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);

  podStatus: string = 'UNKNOWN';
  podDetails: any = null;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.refreshStatus();
  }
refreshStatus(): void {
    this.isLoading = true;
    this.invoiceService.getOcrPodStatus().subscribe({
      next: (res) => {
        this.podStatus = (res?.status || res?.desiredStatus || 'UNKNOWN').toUpperCase();
        this.podDetails = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd pobierania statusu RunPod:', err);
        this.podStatus = 'OFFLINE / BŁĄD';
        this.isLoading = false;
      }
    });
  }

  startPod(): void {
    this.isLoading = true;
    this.invoiceService.startOcrPod().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sukces',
          detail: 'Wysłano żądanie uruchomienia instancji GPU.'
        });
        setTimeout(() => this.refreshStatus(), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się uruchomić instancji OCR.'
        });
      }
    });
  }

  stopPod(): void {
    this.isLoading = true;
    this.invoiceService.stopOcrPod().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Zatrzymano',
          detail: 'Wysłano żądanie zatrzymania instancji GPU.'
        });
        setTimeout(() => this.refreshStatus(), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Błąd',
          detail: 'Nie udało się zatrzymać instancji OCR.'
        });
      }
    });
  }

  getStatusSeverity(): 'success' | 'danger' | 'warning' | 'info' {
    if (this.podStatus === 'RUNNING') return 'success';
    if (this.podStatus === 'STOPPED' || this.podStatus === 'EXITED') return 'danger';
    return 'warning';
  }

}
