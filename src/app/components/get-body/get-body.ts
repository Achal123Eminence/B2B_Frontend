import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-body',
  imports: [CommonModule, RouterModule],
  templateUrl: './get-body.html',
  styleUrl: './get-body.css',
})
export class GetBody implements OnInit {
  bodyList = signal<any[]>([]);
  panelDetailId: any;
  loading = false;
  websiteName: any;

  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.panelDetailId = param.get('panelDetailsId');
      this.fetchBody(this.panelDetailId);
      this.getPanelDetailsData(this.panelDetailId);
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
