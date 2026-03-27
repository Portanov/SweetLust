import { Component } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ConfirmDialogModule],
  template: `<p-confirmDialog></p-confirmDialog>`
})

export class ConfirmationDialogComponent {}
