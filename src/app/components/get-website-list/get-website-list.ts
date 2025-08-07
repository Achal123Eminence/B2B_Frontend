import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-website-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './get-website-list.html',
  styleUrl: './get-website-list.css',
})
export class GetWebsiteList implements OnInit {
  websiteList = signal<any[]>([]);
  motherPanelId: any;
  selectedPanelDetailId: string | null = null;

  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.motherPanelId = param.get('panelId');
      this.fetchWebsites(this.motherPanelId);
    });
  }

  fetchWebsites(id: any) {
    this.apiService.getWebsiteList(id).subscribe((res: any) => {
      this.websiteList.set(res.data);
    });
  }

  refreshComponent(): void {
    const currentUrl = this.router.url;

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  async confirmAndDeleteUser(userId: string) {
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;

    this.apiService.deleteWebsite(userId).subscribe({
      next: () => {
        this.showToast('User deleted successfully');
        this.fetchWebsites(this.motherPanelId); // refresh list
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

  openAddBannerSwal(panelDetailId: string): void {
    this.selectedPanelDetailId = panelDetailId;

    Swal.fire({
      title: 'Add Banner Image',
      html: `
      <div style="text-align: left;">
        <label style="font-weight: 400;font-size:1rem">Image <span style="color: #ff7b7b;">(Image Size: 1132×211)</span></label><br/>
        <input type="file" style="font-size:1rem;width: 100%;border-radius: 10px;margin-top: 3px" id="bannerImage" class="swal2-file" accept="image/*" />
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      background: '#2a3447',
      color: 'white',
      customClass: {
        title: 'custom-swal-title',
      },
      preConfirm: () => {
        const fileInput = document.getElementById(
          'bannerImage'
        ) as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (!file) {
          Swal.showValidationMessage('Please select an image file');
          return;
        }

        return file;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const file: File = result.value;

        const formData = new FormData();
        formData.append('banner', file);
        // formData.append('panelDetailId',this.selectedPanelDetailId || '' );
        formData.append('image_type', 'image'); // hardcoded as you said
        // formData.append('banner_variant', 'default'); // optional if backend sets default

        // 👇 Now call your uploadBanner API
        this.uploadBanner(formData);
      }
    });
  }

  openAddCsvBannerSwal(panelDetailId: string): void {
    this.selectedPanelDetailId = panelDetailId;

    Swal.fire({
      title: 'Upload Banner CSV',
      html: `
      <div style="text-align: left;">
        <label style="font-weight: 400;font-size:1rem">Image</label><br/>
        <input type="file" style="font-size:1rem;width: 100%;border-radius: 10px;margin-top: 3px" id="bannerImage" class="swal2-file" accept=".csv" />
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      background: '#2a3447',
      color: 'white',
      customClass: {
        title: 'custom-swal-title',
      },
      preConfirm: () => {
        const fileInput = document.getElementById(
          'bannerImage'
        ) as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file) {
          Swal.showValidationMessage('Please select an CSV file');
          return;
        }

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
          Swal.showValidationMessage('Only CSV files are allowed');
          return;
        }
        return file;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const file: File = result.value;

        const formData = new FormData();
        formData.append('banner', file);
        // formData.append('panelDetailId',this.selectedPanelDetailId || '' );
        formData.append('image_type', 'csv'); // hardcoded as you said
        // formData.append('banner_variant', 'default'); // optional if backend sets default

        // 👇 Now call your uploadBanner API
        this.uploadBanner(formData);
      }
    });
  }

  uploadBanner(formData: FormData): void {
    // Replace with your service call
    this.apiService.addBanner(this.selectedPanelDetailId, formData).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Banner uploaded!', 'success');
      },
      error: (err) => {
        console.error('Error uploading banner:', err);
        Swal.fire('Error', 'Something went wrong!', 'error');
      },
    });
  }
}
