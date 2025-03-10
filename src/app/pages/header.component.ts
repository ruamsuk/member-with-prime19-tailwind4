import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserProfileComponent } from '../auth/user-profile.component';
import { AuthService } from '../services/auth.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-header',
  imports: [SharedModule, RouterLink, NgOptimizedImage],
  template: `
    <p-menubar [model]="items">
      <ng-template pTemplate="start">
        <img ngSrc="/images/primeng.png" alt="logo" height="51" width="48"/>
      </ng-template>
      <ng-template pTemplate="item" let-item>
        <div class="z-0">
          <a [routerLink]="item.route" class="p-menuitem-link">
            <span [class]="item.icon"></span>
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </div>
      </ng-template>
      <ng-template pTemplate="end">
        <div class="flex items-center gap-2">
          <p-avatar
            image="{{ currentUser()?.photoURL }}"
            shape="circle"
            class=""
          />
          <span
            (click)="menu.toggle($event)"
            class="font-bold text-gray-400 mr-2 cursor-pointer -mt-1"
          >
              {{
              authService.currentUser()?.displayName
                ? authService.currentUser()?.displayName
                : authService.currentUser()?.email
            }}
            <i class="pi pi-angle-down"></i>
            </span>
          <p-menu #menu [model]="subitems" [popup]="true"/>
        </div>
      </ng-template>
    </p-menubar>
  `,
  styles: ``
})
export class HeaderComponent {
  authService = inject(AuthService);
  dialogService = inject(DialogService);
  router = inject(Router);

  items: MenuItem[] | undefined;
  subitems: MenuItem[] | undefined;
  ref: DynamicDialogRef | undefined;
  currentUser = this.authService.currentUser;

  constructor() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => this.router.navigateByUrl('/'),
      },
      {
        label: 'Members',
        icon: 'pi pi-users',
        command: () => this.router.navigateByUrl('/members'),
      },
      {
        label: 'Users',
        icon: 'pi pi-user-plus',
        command: () => this.router.navigateByUrl('/users'),
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        },
      },
    ];

    this.subitems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.userDialog(),
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  private userDialog() {
    this.ref = this.dialogService.open(UserProfileComponent, {
      data: this.currentUser(),
      header: 'User Details',
      width: '500px',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '500px',
        '640px': '500px',
      },
      closable: true,
    });
  }

  private logout() {
    this.authService.logout().then(() => {
      this.router.navigateByUrl('/auth/login').then();
    });
  }
}
