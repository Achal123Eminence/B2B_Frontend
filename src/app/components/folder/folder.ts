import { Component, OnInit, signal,inject } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
declare var bootstrap: any;

@Component({
  selector: 'app-folder',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './folder.html',
  styleUrl: './folder.css',
})
export class Folder implements OnInit {
  private router = inject(Router);
  folderList = signal<any[]>([]);
  panelDetailId: any;
  websiteName: any;
  selectedBannerId: string | null = null;
  loading = false;
  addForm!: FormGroup;
  motherPanellist = signal<any[]>([]);
  editForm!: FormGroup;
  selectedFolderId: string | null = null;
  // import Folder Form
  importFolderForm!: FormGroup;

  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addForm = this.fb.group({
      panelId: ['', Validators.required],
      folder_name: ['', Validators.required],
      image_url: ['', Validators.required],
    });
    // New Edit Form
    this.editForm = this.fb.group({
      panelId: ['', Validators.required],
      folder_name: ['', Validators.required],
      image_url: ['', Validators.required],
    });
    // import folder from
    this.importFolderForm = this.fb.group({
      copyToPanelId:['',Validators.required],
      copyFromPanelId:['',Validators.required],
      importMethod:['',Validators.required]
    })

    this.fetchFolders();
    this.getMotherPanelList();
  }

  fetchFolders() {
    // this.loading = true;
    this.apiService.getFolderList().subscribe(
      (res: any) => {
        this.loading = false;
        this.folderList.set(res.data);
        console.log(this.folderList());
      },
      (err) => {
        this.loading = false;
        this.showToast(err.error.error, true);
        console.error('Failed to get banners', err);
      }
    );
  }

  getMotherPanelList() {
    this.loading = true;
    this.apiService.getMotherPanelList().subscribe((res: any) => {
      this.loading = false;
      this.motherPanellist.set(res?.data?.items || []);
      console.log(this.motherPanellist());
    });
  }

  openAddModal() {
    const modal = document.getElementById('addFolderModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  onSubmitAddFolder() {
    this.loading = true;
    if (this.addForm.invalid) return;

    this.apiService.addFolder(this.addForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Folder Added successfully');
        this.addForm.reset();
        const modalEl = document.getElementById('addFolderModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

        this.fetchFolders(); // Refresh table
      },
      error: (err) => {
        console.log(err)
        this.showToast(err.error.error,true);
        this.loading = false;
      },
    });
  }

  // Open Edit Modal and Prefill Data
  openEditModal(folder: any) {
    console.log(folder,"folder")
    this.selectedFolderId = folder._id;
    this.editForm.patchValue({
      panelId: folder.panelId?._id || '',
      folder_name: folder.folder_name || '',
      image_url: folder.image_url || '',
    });

    const modal = document.getElementById('editFolderModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  // Submit Edit
  onSubmitEditFolder() {
    if (this.editForm.invalid || !this.selectedFolderId) return;

    this.loading = true;
    this.apiService
      .updateFolder(this.selectedFolderId, this.editForm.value)
      .subscribe({
        next: () => {
          this.loading = false;
          this.showToast('Folder updated successfully');

          const modalEl = document.getElementById('editFolderModal');
          if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

          this.fetchFolders(); // refresh table
        },
        error: (err) => {
          console.log(err)
          this.loading = false;
          this.showToast(
            err.error.error || 'Failed to update folder',
            true
          );
        },
      });
  }

  async confirmAndDeleteFolder(mId: string) {
    console.log(mId);
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;

    this.loading = true;

    this.apiService.removeFolder(mId).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Folder deleted successfully');
        this.fetchFolders(); // refresh list
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err.error.error, true);
      },
    });
  }

  private async showConfirmation(
    message: string = 'Are you sure you want to delete this Folder?'
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

  openimportFolderModal() {
    const modal = document.getElementById('importFolderModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  onSubmitImportFolder() {
    this.loading = true;
    if (this.importFolderForm.invalid) return;

    this.apiService.importFolder(this.importFolderForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Folders Imported successfully');
        this.importFolderForm.reset();
        const modalEl = document.getElementById('importFolderModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

        this.fetchFolders(); // Refresh table
      },
      error: (err) => {
        this.showToast(err.error.error,true);
        this.loading = false;
      },
    });
  }
}
