import { Component, inject, signal, OnInit } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { BannerCarouselComponent } from '../../../components/banner/banner.component';

@Component({
  selector: 'app-landing',
  imports: [GalleriaModule, BannerCarouselComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {

  ngOnInit() {
  }
}
