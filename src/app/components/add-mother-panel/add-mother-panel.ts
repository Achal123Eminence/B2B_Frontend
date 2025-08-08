import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api-service';
import { Router,RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-mother-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgIf, NgFor,RouterModule],
  templateUrl: './add-mother-panel.html',
  styleUrl: './add-mother-panel.css',
})
export class AddMotherPanel implements OnInit {
  createMotherPanelForm!: FormGroup;
  apiError: string | null = null;
  userslist = signal<any[]>([]);
  loading = false; 

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createMotherPanelForm = this.fb.group({
      userId: ['', Validators.required],
      mother_panel: ['', Validators.required],
    });

    this.getUsers();
  }

  get f() {
    return this.createMotherPanelForm.controls;
  }

  getUsers() {
    this.loading = true
    this.apiService.getUserList().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.userslist.set(res?.data?.users || []);
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to fetch users', err);
      }
    });
  }

  onSubmit() {
    if (this.createMotherPanelForm.invalid) {
      this.createMotherPanelForm.markAllAsTouched();
      return;
    }

    this.loading = true
    this.apiService.createMotherPanel(this.createMotherPanelForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.showToast('Mother Panel created successfully');
        this.createMotherPanelForm.reset();
      },
      error: (err) => {
        this.loading = false
        this.showToast('Failed to Create Mother Panel', true);
        this.apiError = err?.error?.message || 'API Error';
      }
    });
  }

  onCancel() {
    this.createMotherPanelForm.reset();
  }

  private showToast(message: string, isError: boolean = false): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: isError ? 'error' : 'success',
      title: message,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  }
}
