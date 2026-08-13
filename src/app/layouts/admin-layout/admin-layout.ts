import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header.component';
import { AdminSiderbarComponent } from '../../components/admin-sidebar/admin-siderbar.component';

@Component({
  selector: 'app-admin-layout',
  imports: [
    RouterOutlet,
    AdminHeaderComponent,
    AdminSiderbarComponent
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  sidebarCollapsed = false;

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

}
