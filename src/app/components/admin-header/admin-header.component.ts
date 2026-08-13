import { Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideDynamicIcon } from "@lucide/angular";

@Component({
    selector: 'app-admin-header',
    standalone: true,
    imports: [CommonModule, LucideDynamicIcon],
    template: `
        <header class="h-16 bg-white/80 backdrop-blur-md border-b border-[#e8cad6] flex items-center gap-3 px-5 md:px-7">
            <button
                type="button"
                (click)="toggleSidebar.emit()"
                class="w-11 h-11 rounded-2xl border-none bg-white/75 hover:bg-white transition-all duration-200 grid place-items-center text-[#8f4d61] hover:text-[#7f3f53] shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]"
                [attr.aria-label]="collapsed ? 'Expandir menú' : 'Colapsar menú'"
            >
                @if(collapsed){
                    <svg lucideIcon="panel-left-open" [strokeWidth]="0.75"></svg>
                } @else {
                    <svg lucideIcon="panel-left-close" [strokeWidth]="0.75"></svg>
                }
            </button>

            <div class="h-6 w-px bg-[#d9bcc8]"></div>

            <h1 class="text-xl cinzel text-[#9b5567] tracking-wide leading-none m-0">{{ currentSection }}</h1>
    </header>
  `,
})
export class AdminHeaderComponent {
    @Input() collapsed = false;
    @Output() toggleSidebar = new EventEmitter<void>();

    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    currentSection = this.resolveSection(this.router.url);

    constructor() {
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(() => {
                this.currentSection = this.resolveSection(this.router.url);
            });
    }

    private resolveSection(url: string): string {
        const cleanUrl = url.split('?')[0].split('#')[0];
        const segments = cleanUrl.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1] || 'dashboard';

        const labels: Record<string, string> = {
            dashboard: 'Dashboard',
            orders: 'Orders',
            users: 'Users',
            products: 'Products',
            support: 'Support',
        };

        return labels[lastSegment] || this.toTitleCase(lastSegment);
    }

    private toTitleCase(value: string): string {
        return value
            .replace(/[-_]/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
            .join(' ');
    }
}
