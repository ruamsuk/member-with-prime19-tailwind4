import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-home',
  imports: [SharedModule],
  template: `
    @if (authService.currentUser()) {
      <div class="bg-cover bg-center h-screen w-screen" style="background-image: url('/images/1001.jpg')">
        <div class="flex flex-col items-center justify-center h-1/2">
          <h1 class="text-4xl text-white dark:text-teal-600 font-serif font-black">Welcome to our site</h1>
          <p class="text-black dark:text-white text-xl font-sans">This is a simple Angular application with Firebase authentication.</p>
        </div>
      </div>
    }
  `,
  styles: ``
})
export class HomeComponent {
  public authService: AuthService = inject(AuthService);

}
