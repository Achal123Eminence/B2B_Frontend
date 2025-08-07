import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api-service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-user',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser implements OnInit {
  createUserForm!: FormGroup;
  apiError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createUserForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      cloud_account_id: ['', Validators.required],
      cloud_auth: ['', Validators.required],
      cloud_image_url: [
        '',
        [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)],
      ],
    });
  }

  onSubmit() {
    if (this.createUserForm.invalid) {
      this.createUserForm.markAllAsTouched(); // ✅ Trigger validation display
      return;
    }

    this.apiService.createUser(this.createUserForm.value).subscribe({
      next: (res) => {
        this.showToast('User Created successfully');
        this.createUserForm.reset(); // ✅ Reset the form
  
        // this.router.navigate(['/users-list']); // redirect to users list or any page
      },
      error: (err) => {
        this.showToast('Failed to Create user', true);
        console.error('User creation failed:', err);
      },
    });
  }

  onCancel() {
    this.createUserForm.reset();
  }

  get f() {
    return this.createUserForm.controls;
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
