import { Component,OnInit, signal,inject } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-mother-panel-list',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './mother-panel-list.html',
  styleUrl: './mother-panel-list.css',
})
export class MotherPanelList implements OnInit {
  private router = inject(Router);
  motherPanelList = signal<any[]>([]);
  editForm!: FormGroup;
  selectedId: string | null = null;
  userslist = signal<any[]>([]);

  constructor(private apiService: ApiService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      userId: ['', Validators.required],
      mother_panel: ['', Validators.required],
    });
    this.getmotherPanel();
    this.getUsersList();
  }

  getUsersList() {
    this.apiService.getUserList().subscribe((res: any) => {
      this.userslist.set(res?.data?.users || []);
      console.log(this.userslist());
    });
  }

  getmotherPanel() {
    this.apiService.getMotherPanelList().subscribe((res: any) => {
      this.motherPanelList.set(res?.data?.items || []);
      console.log(this.motherPanelList());
    });
  }

  async confirmAndDeleteMotherPanel(mId: string) {
    console.log('delete hit');
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;

    this.apiService.deleteMotherPanel(mId).subscribe({
      next: () => {
        this.showToast('Mother Panel deleted successfully');
        this.getmotherPanel(); // refresh list
      },
      error: () => {
        this.showToast('Failed to delete Mother Panel', true);
      },
    });
  }

  private async showConfirmation(
    message: string = 'Are you sure you want to delete this Mother Panel?'
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

  addWebsite(id: any) {
    console.log(id, 'add web hit');
    this.router.navigate([`add-website/${id}`]);
  }

  getWebsite(id: any) {
    console.log(id, 'add web hit');
    this.router.navigate([`website-list/${id}`]);
  }
  openEditModal(panel: any) {
    this.selectedId = panel._id;
    this.editForm.patchValue({
      userId: panel.userId._id,
      mother_panel: panel.mother_panel,
    });

    const modal = document.getElementById('editMotherPanelModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  onSubmitEditMotherPanel() {
    if (this.editForm.invalid || !this.selectedId) return;

    this.apiService.updateMotherPanel(this.selectedId, this.editForm.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Mother Panel updated successfully',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          timerProgressBar: true,
        });

        this.editForm.reset();
        const modalEl = document.getElementById('editMotherPanelModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

        this.getmotherPanel(); // Refresh table
      },
      error: (err) => {
        Swal.fire('Error', err?.error?.message || 'Update failed', 'error');
      }
    });

  }
}
