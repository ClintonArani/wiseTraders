import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit, OnDestroy {
  currentTime: string = '';
  isDarkMode: boolean = false;
  private timeInterval: any;

  @Output() languageClicked = new EventEmitter<void>();

  ngOnInit() {
    this.updateTime();
    // Use Angular's built-in setInterval (it will trigger change detection automatically)
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toUTCString();
    // The view should update automatically
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const body = document.body;

    if (this.isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }

  openLanguage() {
    this.languageClicked.emit();
  }
}