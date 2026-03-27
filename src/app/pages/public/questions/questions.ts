import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';

interface Pregunta {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria: string;
  icono?: string;
  popular?: boolean;
}

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    CardModule,
    DividerModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    ChipModule,
  ],
  templateUrl: './questions.html',
  styleUrls: ['./questions.css']
})
export class Questions {
  activeIndex = signal<number | null>(null);

  categorias = [
    { nombre: 'Envío', icono: 'pi pi-truck', key: 'envio' },
    { nombre: 'Pago', icono: 'pi pi-credit-card', key: 'pago' },
    { nombre: 'Información General', icono: 'pi pi-info-circle', key: 'info' },
    { nombre: 'Productos', icono: 'pi pi-box', key: 'productos' },
  ];

  preguntasPorCategoria = {
    envio: [
      {
        id: 'envio-1',
        pregunta: '¿Cuáles son los métodos de envío disponibles?',
        respuesta: 'Ofrecemos envío estándar (5-7 días hábiles), envío express (2-3 días hábiles) y envío inmediato (mismo día disponible en algunas ciudades). Todos nuestros envíos incluyen seguimiento en tiempo real.',
        categoria: 'envio',
        popular: true
      },
      {
        id: 'envio-2',
        pregunta: '¿Cuál es el costo del envío?',
        respuesta: 'El envío estándar es gratuito en compras mayores a $50. El envío express tiene un costo de $10, y el envío inmediato cuesta $25. Para órdenes internacionales, los costos varían según el destino.',
        categoria: 'envio'
      },
      {
        id: 'envio-3',
        pregunta: '¿Cuánto tarda en llegar mi pedido?',
        respuesta: 'Depende del método de envío elegido: Estándar (5-7 días), Express (2-3 días), Inmediato (mismo día). El plazo comienza después de que se procesa tu pago.',
        categoria: 'envio'
      },
      {
        id: 'envio-4',
        pregunta: '¿Hacen envíos internacionales?',
        respuesta: 'Sí, realizamos envíos a toda América Latina, Estados Unidos y Europa. Los tiempos de entrega varían entre 7-15 días hábiles según el destino. Los costos de envío se calculan al momento del checkout.',
        categoria: 'envio'
      }
    ],
    pago: [
      {
        id: 'pago-1',
        pregunta: '¿Qué métodos de pago aceptan?',
        respuesta: 'Aceptamos todas las tarjetas de crédito (Visa, Mastercard, American Express), débito, transferencia bancaria, PayPal, Google Pay y Apple Pay. Todos los pagos son seguros y están encriptados.',
        categoria: 'pago',
        popular: true
      },
      {
        id: 'pago-2',
        pregunta: '¿Es seguro pagar en línea?',
        respuesta: 'Sí, totalmente seguro. Utilizamos encriptación SSL de 256 bits y cumplimos con los estándares PCI DSS. Tus datos de pago nunca se almacenan en nuestros servidores.',
        categoria: 'pago'
      },
      {
        id: 'pago-3',
        pregunta: '¿Ofrecen planes de pago en cuotas?',
        respuesta: 'Sí, contamos con opciones de pago en 3, 6 y 12 cuotas sin interés a través de nuestros aliados financieros. Puedes seleccionar esta opción en el carrito de compra.',
        categoria: 'pago',
        popular: true
      },
      {
        id: 'pago-4',
        pregunta: '¿Puedo pagar contra entrega?',
        respuesta: 'Actualmente no ofrecemos pago contra entrega por medidas de seguridad. Todos los pagos deben realizarse al momento de la compra a través de nuestros métodos de pago disponibles.',
        categoria: 'pago'
      }
    ],
    info: [
      {
        id: 'info-1',
        pregunta: '¿Cómo puedo rastrear mi pedido?',
        respuesta: 'Después de procesar tu compra, recibirás un código de seguimiento por correo electrónico. Puedes ingresarlo en nuestra página de rastreo para ver el estado en tiempo real de tu pedido.',
        categoria: 'info',
        popular: true
      },
      {
        id: 'info-2',
        pregunta: '¿Cuál es la política de devoluciones?',
        respuesta: 'Aceptamos devoluciones hasta 30 días después de la compra si el producto está sin usar y en su empaque original. El envío de devolución es gratuito. Procesamos reembolsos dentro de 5-7 días hábiles.',
        categoria: 'info'
      },
      {
        id: 'info-3',
        pregunta: '¿Tienen garantía en los productos?',
        respuesta: 'Todos nuestros productos cuentan con garantía de 1 año contra defectos de fabricación. Si encuentras algún problema, contáctanos y nos encargaremos de solucionarlo o reemplazarlo.',
        categoria: 'info'
      },
      {
        id: 'info-4',
        pregunta: '¿Cómo contacto al servicio al cliente?',
        respuesta: 'Puedes contactarnos a través de nuestro chat en línea, correo electrónico a soporte@sweetylust.com, o llamando al 55 1234 5678. Estamos disponibles de lunes a viernes de 9:00 a 18:00 hrs.',
        categoria: 'info'
      }
    ],
    productos: [
      {
        id: 'prod-1',
        pregunta: '¿Los productos son originales?',
        respuesta: 'Sí, todos nuestros productos son 100% originales y cuentan con certificados de autenticidad. Trabajamos directamente con marcas reconocidas y distribuidores autorizados.',
        categoria: 'productos',
        popular: true
      },
      {
        id: 'prod-2',
        pregunta: '¿Cómo cuido mis productos?',
        respuesta: 'Cada producto incluye instrucciones de cuidado específicas. Generalmente recomendamos limpiar con un paño suave, evitar la exposición prolongada al sol y mantener en lugar fresco y seco.',
        categoria: 'productos'
      },
      {
        id: 'prod-3',
        pregunta: '¿Tienen tallas disponibles?',
        respuesta: 'Sí, ofrecemos una amplia variedad de tallas. En cada producto encontrarás una guía de tallas detallada para ayudarte a elegir la mejor opción.',
        categoria: 'productos'
      }
    ],
  };

  get todasLasPreguntas(): Pregunta[] {
    return Object.values(this.preguntasPorCategoria).flat();
  }

  getPreguntasPorCategoria(categoria: string): Pregunta[] {
    return this.preguntasPorCategoria[categoria as keyof typeof this.preguntasPorCategoria] || [];
  }

  scrollToCategoria(categoriaId: string): void {
    const element = document.getElementById(categoriaId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onAccordionChange(event: number[]): void {
    this.activeIndex.set(event[0] || null);
  }
}
