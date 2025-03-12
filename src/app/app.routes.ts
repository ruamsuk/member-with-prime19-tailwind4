import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes } from '@angular/router';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['auth/login']);
const redirectLoggedInToHome = () =>
  redirectLoggedInTo(['/']);

export const routes: Routes = [
  {
    path: 'home',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./pages/home.component')
      .then(m => m.HomeComponent),
  },
  {
    path: 'auth',
    ...canActivate(redirectLoggedInToHome),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login.component')
          .then(m => m.LoginComponent),
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./auth/sign-up.component')
          .then(m => m.SignUpComponent),
      }
    ]
  },
  {
    path: 'members',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./members/member-list.component')
      .then(m => m.MemberListComponent),
  },
  {
    path: 'users',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./users/user-list.component')
      .then(m => m.UserListComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];
