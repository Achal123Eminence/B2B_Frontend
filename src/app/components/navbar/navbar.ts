import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  standalone:true
})
export class Navbar {
  private router = inject(Router);
  private api = inject(ApiService);

  logout(): void {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
