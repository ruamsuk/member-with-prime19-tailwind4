import { Component, inject, signal } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-sign-up',
  imports: [SharedModule, NgClass, NgOptimizedImage, Message],
  template: `
    <div class="flex justify-center items-center h-screen gap-y-5">
      <div>
        @if (showMessage()) {
          <div class="center py-3 w-full">
            <p-message [life]="3000" severity="success">
              {{ showMessage() }}
            </p-message>
          </div>
        }
        <form [formGroup]="signUpForm" (ngSubmit)="onSignUp()">
          <p-card [style]="{width: '360px'}">
            <div class="flex justify-center">
              <img ngSrc="/images/primeng-logo.png" alt="logo" height="43" width="40">
            </div>
            <div class="text-center text-900 text-2xl font-medium my-3">
              Create Account
            </div>
            <div class="grid grid-cols-1 gap-4">
              <div>
                @if (isEmailValid) {
                  <label [ngClass]="{'p-error': isEmailValid}">Email</label>
                } @else {
                  <label>Email</label>
                }
                <input
                  type="email"
                  pInputText
                  formControlName="email"
                  name="email"
                  class="w-full {{isEmailValid ? 'ng-valid ng-dirty' : ''}} mt-1">
                @if (isEmailValid; as message) {
                  <small class="block p-error pl-2 py-2 font-semibold">
                    {{ message }}
                  </small>
                }
              </div>
            </div>
            <div class="my-5">
              @if (isValidPassword) {
                <label [ngClass]="{'p-error': isValidPassword}">Password</label>
              } @else {
                <label>Password</label>
              }
              <p-password
                class="w-full {{
                    isValidPassword ? 'ng-invalid ng-dirty' : ''
                  }} mt-2"
                [feedback]="false"
                formControlName="password"
                styleClass="p-password p-component p-inputwrapper p-input-icon-right"
                [style]="{ width: '100%' }"
                [inputStyle]="{ width: '100%' }"
                [toggleMask]="true"
                autocomplete="password"
              />
              @if (isValidPassword; as messages) {
                <small class="block p-error pl-2 font-semibold">
                  {{ messages }}
                </small>
              }
            </div>
            <div>
              <label for="displayName">
                DisplayName
              </label><small class="text-slate-400">(Optional)</small>
              <input
                type="text"
                pInputText
                formControlName="displayName"
                name="displayName"
                class="w-full">

            </div>
            <ng-template #footer>
              <div class="flex items-start justify-center">
                @if (loading()) {
                  <button type="button"
                          class="w-full inline-flex justify-center items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed"
                  >
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                              stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </button>
                } @else {
                  <button type="submit" [disabled]="signUpForm.invalid"
                          [ngClass]="{
                          'btn-disabled': signUpForm.invalid,
                          'btn-enabled': !signUpForm.invalid,
                          }"
                          class="w-full inline-flex justify-center items-center px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-white bg-indigo-400  transition ease-in-out duration-150">
                    SignIn
                  </button>
                }
              </div>
              <div class="relative flex items-center py-4">
                <div class="flex-grow h-px bg-gray-400"></div>
                <span class="flex-shrink px-4 text-gray-500">OR</span>
                <div class="flex-grow h-px bg-gray-400"></div>
              </div>
              <div class="center">
                <p-button
                  label="SignIn With Google"
                  icon="pi pi-google"
                  [loading]="loading()"
                  severity="secondary"
                  styleClass="w-full" (click)="googleSignIn()"/>
              </div>
              <div class="my-5">
                <div class="flex-grow h-px bg-gray-400"></div>
                <span (click)="onSignIn()" class="text-blue-400 italic cursor-pointer hover:text-amber-300 hover:underline hover:underline-offset-2">
                  *Already account sign-in here
                </span>
              </div>
            </ng-template>
          </p-card>
        </form>
      </div>
    </div>
  `,
  styles: `
  `
})
export class SignUpComponent {
  private authService: AuthService = inject(AuthService);
  private toastService: ToastService = inject(ToastService);
  private router: Router = inject(Router);
  private formBuilder: FormBuilder = inject(FormBuilder);

  /** Variable */
  loading = signal<boolean>(false);
  showMessage = signal<string>('');

  /** SignUp Form */
  signUpForm = this.formBuilder.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  /** Check Validators */
  get isEmailValid(): string | boolean {
    const control = this.signUpForm.get('email');

    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid email';
    }

    return false;
  }

  get isValidPassword(): string | boolean {
    const control = this.signUpForm.get('password');
    const isInvalid = control?.invalid && control.touched;

    if (isInvalid) {
      if (control.hasError('required')) {
        return 'This field is required';
      } else if (control.hasError('minlength')) {
        return 'Password must be at least 8 characters long';
      } else {
        return 'Enter a valid password';
      }
    }

    return false;
  }

  onSignUp() {
    if (this.signUpForm.invalid) return;
    const {displayName, email, password} = this.signUpForm.value;

    this.loading.set(true);

    this.authService
      .signupWithDisplayName(<string>email, <string>password, <string>displayName)
      .then(() => {
        this.loading.set(false);
        this.showMessage.set('Sign-up successful! Please check your email to verify your account.');
      })
      .catch((error) => {
        this.loading.set(false);
        this.toastService.showError('Error', error.message);
      });
  }

  onSignIn() {
    this.router.navigateByUrl('/auth/login').then();
  }

  googleSignIn() {
    this.authService.googleSignIn().then(
      () => this.router.navigateByUrl('/home')
    );
  }
}
