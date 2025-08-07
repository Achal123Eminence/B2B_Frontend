import { Component,inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule,RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  private router = inject(Router);
  
  homeData = [
    { title: 'Clients', description: '17' },
    { title: 'Mother Panels', description: '24' },
    { title: 'Websites', description: '109' }
  ];
}
