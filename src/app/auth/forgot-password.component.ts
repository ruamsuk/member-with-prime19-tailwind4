import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { take } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [SharedModule, NgClass],
  template: `
    <div class="flex justify-center items-center">
      <input class="w-full"
             pInputText
             type="email"
             [formControl]="emailForgotPassword"
             placeholder="กรอกอีเมล์ที่ลงทะเบียนไว้"
             [ngClass]="{'ng-invalid ng-dirty': emailForgotPassword.invalid && emailForgotPassword.dirty}"

      />
    </div>
    <div class="flex justify-center items-center gap-3 mt-3">
      <button
        pButton
        type="submit"
        class=""
        size="small"
        [disabled]="loading || !emailForgotPassword.value"
        (click)="forgotPassword()"
      >
        @if (!loading) {
          @if (emailForgotPassword.value) {
            <span>Reset Password</span>
          } @else {
            <span>Enter Email</span>
          }
        } @else {
          <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          >Processioning</span>
        }
      </button>
      <button pButton size="small" severity="secondary" (click)="dialogRef.close()">Cancel</button>
    </div>
  `,
  styles: `
    .ng-invalid.ng-dirty {
      border-color: red;
      color: red;
    }
  `,
})
export class ForgotPasswordComponent {
  emailForgotPassword = new FormControl();
  loading = false;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    public dialogRef: DynamicDialogRef,
  ) {
  }

  forgotPassword() {
    if (this.emailForgotPassword.value == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid email address.',
      });
      return;
    }

    this.loading = true;

    let email = this.emailForgotPassword.value;
    console.log(typeof email, 'email ', email);

    this.authService
      .forgotPassword(email)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Email sent successfully.',
          });
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
          });
        },
        complete: () => {
          this.loading = false;
          this.dialogRef.close(true);
        },
      });
  }
}
