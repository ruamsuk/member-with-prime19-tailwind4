import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private messageService: MessageService) {
  }

  showSuccess(summary: string, msg: string) {
    this.messageService.add({ severity: 'success', summary: summary, detail: msg, life: 4000 });
  }

  showInfo(summary: string, msg: string) {
    this.messageService.add({ severity: 'info', summary: summary, detail: msg, life: 4000 });
  }

  showWarn(summary: string, msg: string) {
    this.messageService.add({ severity: 'warn', summary: summary, detail: msg, life: 4000 });
  }

  showError(summary: string, msg: string) {
    this.messageService.add({ severity: 'error', summary: summary, detail: msg, life: 4000 });
  }

  showContrast(summary: string, msg: string) {
    this.messageService.add({ severity: 'contrast', summary: summary, detail: msg, life: 4000 });
  }

  showSecondary(summary: string, msg: string) {
    this.messageService.add({ severity: 'secondary', summary: summary, detail: msg, life: 4000 });
  }
}
