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

  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.panelDetailId = param.get('panelDetailsId');
      this.fetchBanners(this.panelDetailId);
    });
  }

  fetchBanners(id: any) {
    this.apiService.getBanners(id).subscribe((res: any) => {
      this.bannerList.set(res.data);
    });
  }

  async confirmAndDeleteBanners(mId: string) {
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;

    this.apiService.deleteBanner(mId).subscribe({
      next: () => {
        this.showToast('Mother Panel deleted successfully');
        this.fetchBanners(this.panelDetailId); // refresh list
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
}
