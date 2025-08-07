import { Component, OnInit, signal,inject } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-users-list',
  imports: [CommonModule, RouterModule,ReactiveFormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersList implements OnInit {
  userslist = signal<any[]>([]);
  private router = inject(Router);
  editUserForm!: FormGroup;
  selectedUserId: string | null = null;

  constructor(private apiService: ApiService,private fb: FormBuilder) {}

  ngOnInit(): void {
    this.editUserForm = this.fb.group({
      username: ['', Validators.required],
      password: [''], // Optional update
      cloud_account_id: ['', Validators.required],
      cloud_auth: ['', Validators.required],
      cloud_image_url: [
        '',
        [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)],
      ],
    });
    this.fetchUsers();
  }

  fetchUsers() {
    this.apiService.getUserList().subscribe((res: any) => {
      this.userslist.set(res?.data?.users || []);
    });
  }

  async confirmAndDeleteUser(userId: string) {
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;

    this.apiService.deleteUser(userId).subscribe({
      next: () => {
        this.showToast('User deleted successfully');
        this.fetchUsers(); // refresh list
      },
      error: () => {
        this.showToast('Failed to delete user', true);
      },
    });
  }

  private async showConfirmation(
    message: string = 'Are you sure you want to delete this user?'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title: 'Confirm',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    return result.isConfirmed;
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

  openEditUserModal(user: any): void {
    this.selectedUserId = user._id;
    this.editUserForm.patchValue({
      username: user.username || '',
      cloud_account_id: user.cloud_account_id || '',
      cloud_auth: user.cloud_auth || '',
      cloud_image_url: user.cloud_image_url || '',
      password: user.password || '', // blank by default
    });

    // Open Bootstrap modal
    const modalElement = document.getElementById('editUserModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onSubmitEditUser(): void {
    if (this.editUserForm.invalid || !this.selectedUserId) return;

    const payload = { ...this.editUserForm.value };

    if (!payload.password) {
      delete payload.password; // Don't send empty password
    }

    this.apiService.updateUser(this.selectedUserId, payload).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'User updated successfully',
          showConfirmButton: false,
          timer: 2000, // Close after 2 seconds
        });

        //Close Bootstrap modal
        const modalEl = document.getElementById('editUserModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl!);
        modalInstance?.hide();

        //Reset form
        this.editUserForm.reset();

        this.fetchUsers();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Update failed', 'error');
      },
    });
  }
}
