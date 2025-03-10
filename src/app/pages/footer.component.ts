import { Component, HostListener, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer [class.hidden]="!isFooterVisible()"
            class="fixed bottom-0 left-0 w-full bg-gray-800 text-white text-center py-3 transition-opacity duration-300">
      <p class="text-sm md:text-lg text-gray-400 dark:text-gray-400">
        Copyright &copy; {{ _year }} Ruamsuk&trade; Kanchanaburi.
        <i class="pi pi-sparkles opacity-80"></i>
    </footer>
  `,
  styles: `
    footer {
      transition: opacity 0.3s ease-in-out;
    }
  `
})
export class FooterComponent {
  _year = new Date().getFullYear();
  isFooterVisible = signal(true);

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const bodyHeight = document.body.offsetHeight;

    /** ตรวจสอบว่าเลื่อนถึง footer หรือยัง */
    if (scrollPosition + windowHeight >= bodyHeight - 60) {
      this.isFooterVisible.set(false);
    } else {
      this.isFooterVisible.set(true);
    }
  }
}
