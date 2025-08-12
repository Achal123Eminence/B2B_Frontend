import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { single } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-get-body',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './get-body.html',
  styleUrl: './get-body.css',
})
export class GetBody implements OnInit {
  bodyList = signal<any[]>([]);
  panelDetailId: any;
  loading = false;
  websiteName: any;
  editBodyForm!: FormGroup;
  selectedBodyId: string | null = null;
  previewImage: string | null = null;
  folderList = signal<any[]>([]);
  imageUrl: string | null = null;


  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.panelDetailId = param.get('panelDetailsId');
      this.fetchBody(this.panelDetailId);
      this.getPanelDetailsData(this.panelDetailId);
    });
    this.editBodyForm = this.fb.group({
      folderId: ['', Validators.required],
      image: [''],
      imagePosition: ['', Validators.required],
      imageClass: ['', Validators.required],
      bodyVariant: ['', Validators.required],
    });

    this.getFolderList(); // To populate dropdown
  }

  getPanelDetailsData(id: any) {
    this.loading = true;
    this.apiService.getSingleWebsiteList(id).subscribe(
      (res: any) => {
        this.loading = false;
        this.websiteName = res.data.website_name;
        console.log(this.websiteName, 'this.websiteName');
      },
      (err) => {
        this.loading = false;
        this.showToast('Failed to get panel details', true);
        console.error('Failed to get panel details', err);
      }
    );
  }

  getFolderList(){
    this.loading = true;
    this.apiService.getFolderList().subscribe(
      (res: any) => {
        this.loading = false;
        this.folderList.set(res.data);
        console.log(this.folderList(),"this.folder()");
      },
      (err) => {
        this.loading = false;
        // this.showToast('Failed to get banners', true);
        console.error('Failed to get body', err);
      }
    );
  }

  fetchBody(id: any) {
    this.loading = true;
    this.apiService.getBody(id).subscribe(
      (res: any) => {
        this.loading = false;
        this.bodyList.set(res.bodies);
        console.log(this.bodyList());
      },
      (err) => {
        this.loading = false;
        // this.showToast('Failed to get banners', true);
        console.error('Failed to get body', err);
      }
    );
  }

  async confirmAndDeleteBanners(mId: string) {
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;

    this.loading = true;

    this.apiService.deleteBody(mId).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Body deleted successfully');
        this.fetchBody(this.panelDetailId); // refresh list
      },
      error: () => {
        this.loading = false;
        this.showToast('Failed to delete Body', true);
      },
    });
  }

  private async showConfirmation(
    message: string = 'Are you sure you want to delete this Body?'
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

  // Open modal with pre-filled data
  openEditBodyModal(body: any) {
    console.log(body,"body")
    this.selectedBodyId = body._id;
    this.previewImage = body.image
      ? body.panelDetailsId.userId.cloud_image_url + body.image + '/' + body.bodyVariant
      : null;
    this.imageUrl = body.folderId.image_url;
    this.editBodyForm.patchValue({
      folderId: body.folderId?._id || '',
      imagePosition: body.imagePosition || '',
      imageClass: body.imageClass || 'no',
      bodyVariant: body.bodyVariant || '',
    });

    const modal = document.getElementById('editBodyModal');
    if (modal) new bootstrap.Modal(modal).show();
  }

  // Handle image selection
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editBodyForm.patchValue({ image: file });
      const reader = new FileReader();
      reader.onload = (e: any) => (this.previewImage = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  // Submit update
  onSubmitEditBody() {
    if (this.editBodyForm.invalid || !this.selectedBodyId) return;

    const formData = new FormData();

    // Append text fields (exclude 'image')
    Object.entries(this.editBodyForm.value).forEach(([key, value]) => {
      if (key !== 'image' && value !== null && value !== undefined) {
        formData.append(key, value as any);
      }
    });

    // Append file if selected
    if (this.editBodyForm.get('image')?.value) {
      formData.append('image', this.editBodyForm.get('image')?.value);
    }

    this.loading = true;
    this.apiService.updateBody(this.selectedBodyId, formData).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Body updated successfully');
        const modalEl = document.getElementById('editBodyModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        this.fetchBody(this.panelDetailId); // Refresh list
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err?.error?.message || 'Failed to update body', true);
      },
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
}
