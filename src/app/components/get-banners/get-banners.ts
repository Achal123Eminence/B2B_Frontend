import {
  Component,
  OnInit,
  signal,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

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
    private router: Router,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
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
       <div style="display:flex;gap:5px;">
        <div style="width:50%">
         <label style="font-weight: 400;font-size:1rem">Image <span style="color: #ff7b7b;">(Image Size: 1132×211)</span></label><br/>
         <input type="file" style="font-size:1rem;width: 100%;border-radius: 10px;margin-top: 3px" id="bannerImage" class="swal2-file" accept="image/*" />
        </div>
        <div style="width:50%">
         <label style="font-weight: 400;font-size:1rem;display:block">Banner Variant</label>
         <input type="text" id="bannerVariant" value="${
           data.banner_variant || ''
         }" style="font-size:1rem;width: 100%;border-radius: 10px;margin-top: 5px;padding:8px;background:#374258;color:#b7c5df;border:1px solid white;" />
        </div>
       </div>
        <img src="${data.userId.cloud_image_url}${data.banner}/${
        data.banner_variant
      }" alt="Banner Preview" style="margin-top:10px;max-width:100%;width:10rem;height:4rem;display:block" />
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
        const variantInput = document.getElementById(
          'bannerVariant'
        ) as HTMLInputElement;

        const file = fileInput?.files?.[0] || null;
        const variant = variantInput?.value?.trim() || '';

        // Allow empty file if variant is changed
        if (!file && variant === data.banner_variant) {
          Swal.showValidationMessage(
            'Please select an image or update the variant.'
          );
          return;
        }

        return { file, banner_variant: variant };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {

        const { file, banner_variant } = result.value;
        const formData = new FormData();
        if (file) {
          formData.append('banner', file);
        }
        formData.append('banner_variant', banner_variant);
        formData.append('image_type', 'image');
        this.uploadBanner(formData);
      }
    });
  }

  uploadBanner(formData: FormData): void {
    // Replace with your service call
    this.loading = true;
    this.apiService
      .updateBanner(this.selectedBannerId, formData)
      .subscribe({
        next: () => {
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
      },
      (err) => {
        this.loading = false;
        this.showToast('Failed to get panel details', true);
        console.error('Failed to get panel details', err);
      }
    );
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
