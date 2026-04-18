// home.component.ts
import { Component, ElementRef, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../components/header/header';
import { Footer } from '../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  @ViewChild('scrollContainer', { static: false })
  scrollContainer!: ElementRef<HTMLDivElement>;

  @ViewChildren('item') items!: QueryList<ElementRef>;

  // Overlay visibility state
  isOverlayVisible: boolean = false;
isLanguageModal = false;
currentLanguage = 'English';

languages = [
  { code: 'en', name: 'English', flagEmoji: '🇬🇧' },
  { code: 'ar', name: 'العربية', flagEmoji: '🇸🇦' },
  { code: 'el', name: 'Ελληνικά', flagEmoji: '🇬🇷' },
  { code: 'de', name: 'Deutsch', flagEmoji: '🇩🇪' },
  { code: 'es', name: 'Español', flagEmoji: '🇪🇸' },
  { code: 'fr', name: 'Français', flagEmoji: '🇫🇷' },
  { code: 'it', name: 'Italiano', flagEmoji: '🇮🇹' },
  { code: 'sw', name: 'Kiswahili', flagEmoji: '🇹🇿' },
  { code: 'am', name: 'የሠራን', flagEmoji: '🇪🇹' },
  { code: 'ko', name: '한국어', flagEmoji: '🇰🇷' },
  { code: 'pl', name: 'Polish', flagEmoji: '🇵🇱' },
  { code: 'pt', name: 'Português', flagEmoji: '🇵🇹' },
  { code: 'ru', name: 'Русский', flagEmoji: '🇷🇺' },
  { code: 'my', name: 'စိတ်စား', flagEmoji: '🇲🇲' },
  { code: 'tr', name: 'Türkçe', flagEmoji: '🇹🇷' },
  { code: 'uz', name: "O'zbek", flagEmoji: '🇺🇿' },
  { code: 'vi', name: 'Tiếng Việt', flagEmoji: '🇻🇳' },
  { code: 'zh-CN', name: '简体中文', flagEmoji: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flagEmoji: '🇹🇼' }
];

constructor() {
  const savedLanguage = localStorage.getItem('selectedLanguage');
  if (savedLanguage) {
    this.currentLanguage = savedLanguage;
  }
}

openLanguageModal() {
  this.isLanguageModal = true;
}

closeLanguageModal(event?: MouseEvent) {
  if (event && (event.target as HTMLElement).classList.contains('bg-black/50')) {
    this.isLanguageModal = false;
  } else if (!event) {
    this.isLanguageModal = false;
  }
}

selectLanguage(languageName: string) {
  const selectedLang = this.languages.find(lang => lang.name === languageName);
  if (selectedLang) {
    this.currentLanguage = selectedLang.name;
    localStorage.setItem('selectedLanguage', selectedLang.name);
    localStorage.setItem('selectedLanguageCode', selectedLang.code);
    this.isLanguageModal = false;
    // Fixed: removed .flag since it doesn't exist in the object
    console.log(`Language changed to: ${selectedLang.name} (${selectedLang.code})`);
  }
}
  // AI Scanner
  isAiScannerVisible: boolean = false;
  ticks: number = 500;

  // Open modal
  openAiScanner() {
    this.isAiScannerVisible = true;
  }

  // Close modal
  closeAiScanner(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.isAiScannerVisible = false;
    }
  }


  scrollToItem(element: HTMLElement) {
    if (!element || !this.scrollContainer) {
      console.error('Element or container not found');
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  // Open the overlay when Run button is clicked
  openOverlay() {
    this.isOverlayVisible = true;
  }

  // Close the overlay (for Cancel button or X button)
  closeOverlay() {
    this.isOverlayVisible = false;
  }
  // Close overlay when clicking on the backdrop (optional)
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeOverlay();
    }
  }

  

  
}