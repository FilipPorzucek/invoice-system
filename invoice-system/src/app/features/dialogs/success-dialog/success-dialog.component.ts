import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  templateUrl: './success-dialog.component.html',
  styleUrl: './success-dialog.component.scss'
})
export class SuccessDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() header = 'Sukces';
  @Input() message = '';
  @Output() confirmed = new EventEmitter<void>();

  confirm() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.confirmed.emit();
  }
}
