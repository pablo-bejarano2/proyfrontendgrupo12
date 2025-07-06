import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';
declare var bootstrap: any;

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, AdminSidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  closeSidebar() {
    const sidebar = document.getElementById('adminSidebarOffcanvas');
    if (sidebar) {
      const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(sidebar);
      offcanvas.hide();
    }
  }
}
