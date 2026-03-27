// banner-carousel.component.ts
import { Component, OnInit, OnDestroy, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagesService, LocalImage } from '../../services/images/images.service';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="banner-container">
      <!-- Imagen de fondo -->
      <div class="banner-slides" [style.transform]="'translateX(-' + currentIndex * 100 + '%)'">
        <div *ngFor="let image of images(); let i = index" class="banner-slide">
          <img [src]="image.itemImageSrc" [alt]="image.alt" class="banner-image" />
        </div>
      </div>

      <!-- Overlay negro transparente -->
      <div class="banner-overlay"></div>

      <!-- Contenido central -->
      <div class="banner-content">
        <h1 class="company-name font-logo tracking-wider">{{ companyName }}</h1>
        <p class="company-slogan nova-round-regular">{{ companySlogan }}</p>
      </div>

      <!-- Indicadores -->
      <div class="banner-indicators">
        <button
          *ngFor="let image of images(); let i = index"
          class="indicator"
          [class.active]="i === currentIndex"
          (click)="goToSlide(i)">
        </button>
      </div>

      <!-- Botones de navegación -->
      <button class="nav-button prev" (click)="prevSlide()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button class="nav-button next" (click)="nextSlide()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .banner-container {
      position: relative;
      width: 100%;
      height: 100vh;
      max-height: 800px;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    /* Slides */
    .banner-slides {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.5s ease-in-out;
    }

    .banner-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
    }

    .banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Overlay negro transparente */
    .banner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 1;
    }

    /* Contenido central */
    .banner-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 2;
      width: 90%;
      max-width: 800px;
      animation: fadeInUp 0.8s ease;
    }

    .company-name {
      font-size: 8.5rem;
      margin: 0 0 1rem 0;
    }

    .company-slogan {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .cta-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 32px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }

    /* Indicadores */
    .banner-indicators {
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      z-index: 2;
    }

    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s ease;
    }

    .indicator.active {
      background: white;
      width: 30px;
      border-radius: 5px;
    }

    .indicator:hover {
      background: white;
      transform: scale(1.2);
    }

    /* Botones de navegación */
    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(5px);
      border: none;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 2;
    }

    .nav-button:hover {
      background: rgba(255, 255, 255, 0.4);
      transform: translateY(-50%) scale(1.1);
    }

    .nav-button svg {
      width: 24px;
      height: 24px;
      stroke: white;
    }

    .nav-button.prev {
      left: 20px;
    }

    .nav-button.next {
      right: 20px;
    }

    /* Animaciones */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translate(-50%, -40%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .banner-container {
        height: 70vh;
        min-height: 500px;
      }

      .company-name {
        font-size: 2rem;
      }

      .company-slogan {
        font-size: 1rem;
        margin-bottom: 1.5rem;
      }

      .cta-button {
        padding: 10px 24px;
        font-size: 0.875rem;
      }

      .nav-button {
        width: 40px;
        height: 40px;
      }

      .nav-button svg {
        width: 20px;
        height: 20px;
      }
    }

    @media (max-width: 480px) {
      .company-name {
        font-size: 1.5rem;
      }

      .company-slogan {
        font-size: 0.875rem;
      }

      .nav-button {
        width: 32px;
        height: 32px;
      }

      .nav-button.prev {
        left: 10px;
      }

      .nav-button.next {
        right: 10px;
      }
    }
  `]
})
export class BannerCarouselComponent implements OnInit, OnDestroy {
  private localImageService = inject(ImagesService);

  images = signal<LocalImage[]>([]);
  currentIndex = 0;
  private autoPlayInterval: any;

  @Input() companyName = 'Mi Empresa';
  @Input() companySlogan = 'Transformando ideas en realidad';
  @Input() ctaText = 'Conócenos';
  @Input() folderName = 'banner';

  ngOnInit() {
    this.loadImages();
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  async loadImages() {
    const imagenes = await this.localImageService.getImagesFromFolder(this.folderName);
    this.images.set(imagenes);
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    if (this.images().length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.images().length;
      this.resetAutoPlay();
    }
  }

  prevSlide() {
    if (this.images().length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.images().length) % this.images().length;
      this.resetAutoPlay();
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.resetAutoPlay();
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  onCtaClick() {
    console.log('CTA clicked');
  }
}
