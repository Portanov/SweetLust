import { Injectable } from '@angular/core';

export interface LocalImage {
  itemImageSrc: string;
  alt?: string;
  title?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor() { }

  /**
   * Obtiene todas las imágenes de una carpeta específica
   * @param folderName - Nombre de la carpeta dentro de assets/images/
   * @returns Array de imágenes para el carrusel
   */
  getImagesFromFolder(folderName: string): Promise<LocalImage[]> {
    const images: LocalImage[] = [];

    const imageFiles = [
      'paleta.jpg',
      'lenceria.jpg',
      'mujerlenceria.png'
    ];

    imageFiles.forEach((file, index) => {
      images.push({
        itemImageSrc: `images/${folderName}/${file}`,
        alt: `Banner ${index + 1}`,
        title: `Banner ${index + 1}`
      });
    });

    return Promise.resolve(images);
  }
}
