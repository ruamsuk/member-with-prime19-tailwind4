import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { getAuth, User } from '@angular/fire/auth';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { combineLatest, concatMap, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ImageUploadService } from '../services/image-upload.service';
import { ToastService } from '../services/toast.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-user-profile',
  imports: [
    SharedModule,
    AsyncPipe,
  ],
  template: `
    <hr class="h-px bg-gray-200 border-0"/>
    @if (user$ | async; as user) {
      <div class="flex justify-center py-5">
        <div class="profile-image">
          <img [src]="user.photoURL ?? '/images/dummy-user.png'"
               alt="photo">
          <p-button
            id="in"
            icon="pi pi-pencil"
            severity="success"
            [rounded]="true"
            [raised]="true"
            (click)="inputField.click()"/>
        </div>
        <input #inputField
               type="file"
               hidden="hidden"
               (change)="uploadImage($event, user)"/>

      </div>
      <div class="flex flex-wrap flex-col justify-center">
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            <div>
              <label for="firstName">First Name:</label>
              <input pInputText formControlName="firstName" class="w-full" id="firstName"/>
            </div>
            <div>
              <label for="lastName">Last Name:</label>
              <input pInputText formControlName="lastName" class="w-full" id="lastName">
            </div>
            <div>
              <label for="display">Display Name:</label>
              <input pInputText formControlName="displayName" class="w-full" id="display">
            </div>
            <div>
              <label for="email">Email:</label>
              <input pInputText formControlName="email" class="w-full" id="email"/>
            </div>
            <div>
              <label for="phone">Phone:</label>
              <input pInputText formControlName="phone" class="w-full" id="phone"/>
            </div>
            <div>
              <label for="role">Role:</label>
              <input pInputText formControlName="role" class="w-full" id="role"/>
            </div>
          </div>
          <div class="flex justify-center items-center my-5">
            @if (verify) {
              <span class="text-green-400 cursor-default">
                <i class="pi pi-verified mr-2"></i>
                Verified User.
              </span>
            } @else if (!verify) {
              <span class="ml-2 text-orange-400 cursor-pointer" (click)="sendEmail()">
                <i class="pi pi-send mr-2"></i>
                Click to Verified your email.
              </span>
            }
          </div>
          <div class="grid">
            <label for="address" class="mb-2 ml-2">Address</label>
            <textarea
              rows="3"
              pTextarea
              formControlName="address"
              class="w-full"
            ></textarea>
          </div>
          <div class="my-5">
            <hr class="h-px bg-gray-400 border-0"/>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <p-button
              label="Cancel"
              severity="secondary"
              styleClass="w-full"
              class="w-full mr-2"
              (click)="close()"
            />
            <p-button
              label="Save"
              styleClass="w-full"
              class="w-full"
              (click)="saveProfile()"
            />
          </div>
        </form>

      </div>
    }

  `,
  styles: `
    .profile-image > img {
      border-radius: 100%;
      object-fit: cover;
      object-position: center;
    }

    .profile-image {
      position: relative;
    }

    .profile-image > #in {
      position: absolute;
      bottom: 5px;
      left: 80%;
    }

    label {
      color: gray;
      margin-left: 5px;
    }
  `
})
export class UserProfileComponent {
  authService: AuthService = inject(AuthService);
  ref = inject(DynamicDialogRef);
  imageUploadService: ImageUploadService = inject(ImageUploadService);
  verify: boolean | undefined = false;
  disabled: boolean = true;
  role: string = '';
  user$: Observable<any> = this.authService.currentUser$;

  profileForm = new FormGroup({
    uid: new FormControl(''),
    displayName: new FormControl(''),
    email: new FormControl({value: '', disabled: this.disabled}),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    phone: new FormControl(''),
    address: new FormControl(''),
    role: new FormControl({value: '', disabled: this.disabled}),
    // photoURL: new FormControl(''),
  });

  private messageService: ToastService = inject(ToastService);
  private router: Router = inject(Router);
  private auth = getAuth();

  constructor() {
    this.getUserProfile();
    this.getUserRole().then();
  }

  getUserProfile() {
    this.verify = this.auth.currentUser?.emailVerified;

    combineLatest([
      this.authService.currentUser$,
      this.authService.userProfile$
    ])
      .pipe()
      .subscribe(([authUser, userProfile]) => {
        const combineUser = {...authUser, ...userProfile};
        this.profileForm.patchValue(combineUser);
        localStorage.setItem('user', JSON.stringify(userProfile));
      });
  }

  async getUserRole() {
    this.role = await this.authService.getRoles() as string;
    this.profileForm.patchValue({role: this.role});
  }

  uploadImage(event: any, user: User) {
    const file = event.target.files[0];
    this.imageUploadService
      .uploadImage(file, `images/profile/${user.uid}`)
      .pipe(
        concatMap(() =>
          this.imageUploadService.getDownloadURL(`images/profile/${user.uid}`)
        ),
        concatMap((photoURL: string) =>
          this.authService.updateProfile({
            uid: user.uid,
            photoURL,
          })
        )
      )
      .subscribe();
  }

  compareUserData(formData: any): boolean {
    const storedUserData = JSON.parse(<string>localStorage.getItem('user'));
    if (!storedUserData) return false;

    const fieldsToCompare = [
      'displayName', 'email', 'role', 'uid',
      'firstName', 'lastName', 'phone', 'address'
    ];

    for (const field of fieldsToCompare) {
      if (storedUserData[field] !== formData[field]) return true;
    }
    return false;
  }


  async saveProfile() {
    const formData = this.profileForm.getRawValue();
    const isChange = this.compareUserData(formData);

    if (isChange) {
      const profileData = formData;
      try {
        await this.authService.newUser({
          uid: profileData.uid,
          email: profileData.email,
          displayName: profileData.displayName,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address,
          role: profileData.role || 'user',
        });
        this.ref.close();
        this.messageService.showSuccess('Successfully', 'Profile Saved.');
      } catch (error: any) {
        this.messageService.showError('Error', error.message);
      }
    } else {
      this.messageService.showInfo('No changes detected', 'Profile is up to date.');
      this.ref.close();
    }
  }

  async sendEmail() {
    await this.authService
      .sendEmailVerification()
      .then(() => {
        this.messageService.showSuccess('SuccessFully', 'Check your email inbox.');
        this.authService.logout()
          .then(() => this.router.navigateByUrl('/auth/login'));
      })
      .catch((e) => this.messageService.showError('Error', e.message));
  }

  close() {
    localStorage.removeItem('user');
    this.ref.close();
  }
}
