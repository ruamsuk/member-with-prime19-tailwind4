import { Component, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { User } from '../models/user.model';
import { ToastService } from '../services/toast.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-users-list',
  imports: [
    ProgressSpinner,
    TableModule,
  ],
  template: `
    @if (loading()) {
      <div class="loading-shade">
        <p-progressSpinner strokeWidth="4" ariaLabel="loading"/>
      </div>
    }
    @if (getUsers()) {
      <div class="container mx-auto">
        <div class="table-container mt-3">
          <p-table
            [value]="getUsers()"
            selectionMode="single"
            [(selection)]="selectedUser"
            dataKey="uid"
            (onRowSelect)="onRowSelected($event)"
            (onRowUnselect)="onRowUnSelected($event)">
            <ng-template #caption>
              <div class="grid grid-cols-1">
                <p class="hidden md:block text-center text-lg md:text-xl text-sky-500">
                  Change User Roles
                </p>
                <p class="hidden md:block text-center">
                  Click on row to automatic change role, Click again to role back
                </p>
              </div>
            </ng-template>
            <ng-template #header>
              <tr>
                <th>Email</th>
                <th>displayName</th>
                <th>Role</th>
              </tr>
            </ng-template>
            <ng-template #body let-user let-i="rowIndex">
              <tr [pSelectableRow]="user">
                @if (user.role != 'admin' && user.role != 'manager') {
                  <td>{{ user.email }}</td>
                  <td>{{ user.displayName }}</td>
                  <td>{{ user.role }}</td>
                }
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    }

  `,
  styles: ``
})
export class UserListComponent implements OnDestroy {
  private userService: UsersService = inject(UsersService);
  private toastService = inject(ToastService);

  ref: DynamicDialogRef | undefined;
  selectedUser!: User;
  users!: User[];
  user!: User;
  loading = signal<boolean>(true);

  getUsers = toSignal(
    (this.userService.getAllUsers() as Observable<User[]>)
      .pipe(
        tap(() => {
          this.loading.set(false);
        }),
        catchError((err: any) => {
          this.loading.set(false);
          this.toastService.showError('Error', err.message);
          return throwError(() => err);
        })
      ),
    {
      initialValue: [],
    }
  );

  ngOnDestroy(): void {
    if (this.ref) this.ref.destroy();
  }

  onRowSelected(event: any) {
    this.userService.updateRole(event.data).subscribe(() => {
      this.toastService.showInfo('Change User role', `User role has Change to 'member'`);
    });
  }

  onRowUnSelected(event: any) {
    this.userService.reRole(event.data).subscribe(() => {
      this.toastService.showInfo('Change User role', `User role back to 'user'`);
    });
  }
}
