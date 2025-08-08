import { Component,OnInit,signal } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-banners',
  imports: [CommonModule, RouterModule],
  templateUrl: './get-banners.html',
  styleUrl: './get-banners.css',
})
export class GetBanners implements OnInit {
  bannerList = signal<any[]>([]);
  panelDetailId: any;
  websiteName: any;
  selectedBannerId: string | null = null;
  loading = false;

  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.panelDetailId = param.get('panelDetailsId');
      this.fetchBanners(this.panelDetailId);
      this.getPanelDetailsData(this.panelDetailId);
    });
  }

  fetchBanners(id: any) {
    this.loading = true;
    this.apiService.getBanners(id).subscribe(
      (res: any) => {
        this.loading = false;
        this.bannerList.set(res.data);
        console.log(this.bannerList());
      },
      (err) => {
        this.loading = false;
        this.showToast('Failed to get banners', true);
        console.error('Failed to get banners', err);
      }
    );
  }

  async confirmAndDeleteBanners(mId: string) {
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;

    this.loading = true;

    this.apiService.deleteBanner(mId).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Mother Panel deleted successfully');
        this.fetchBanners(this.panelDetailId); // refresh list
      },
      error: () => {
        this.loading = false;
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

  openAddBannerSwal(panelDetailId: string, data: any): void {
    this.selectedBannerId = panelDetailId;

    Swal.fire({
      title: 'Update Banner Image',
      html: `
        <div style="text-align: left;">
          <label style="font-weight: 400;font-size:1rem">Image <span style="color: #ff7b7b;">(Image Size: 1132×211)</span></label><br/>
          <input type="file" style="font-size:1rem;width: 100%;border-radius: 10px;margin-top: 3px" id="bannerImage" class="swal2-file" accept="image/*" />
          <img src="${data.userId.cloud_image_url}${data.banner}/${data.banner_variant}" alt="" srcset="" style="margin-top:10px;max-width:100%;width:10rem;height:4rem">
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
        formData.append('image_type', 'image'); // hardcoded as you said
        formData.append('banner_variant', 'Banner'); // optional if backend sets default

        // 👇 Now call your uploadBanner API
        this.uploadBanner(formData);
      }
    });
  }

  uploadBanner(formData: FormData): void {
    // Replace with your service call
    this.loading = true;
    this.apiService.updateBanner(this.selectedBannerId, formData).subscribe({
      next: (res) => {
        this.loading = false;
        this.showToast('Banner updated successfully');
        this.fetchBanners(this.panelDetailId);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error uploading banner:', err);
        Swal.fire('Error', 'Something went wrong!', 'error');
      },
    });
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
}
