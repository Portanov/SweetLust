import { Component, inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [ToastModule],
  template: `
    <p-toast position="bottom-right" />
  `,
  styles: [``]
})
export class AlertComponent {
  messageService = inject(MessageService);
}
