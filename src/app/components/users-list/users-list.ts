import { Component, OnInit, signal,inject } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users-list',
  imports: [CommonModule,RouterModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersList implements OnInit {
  userslist = signal<any[]>([]);
  private router = inject(Router);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.apiService.getUserList().subscribe((res: any) => {
      this.userslist.set(res?.data?.users || []);
      console.log(this.userslist(), 'userslist');
    });
  }

  async confirmAndDeleteUser(userId: string) {
    console.log("delete hit")
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

  hitme(){
    console.log("hit me ?????")
  }
}
