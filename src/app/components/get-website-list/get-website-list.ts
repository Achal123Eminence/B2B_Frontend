import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  signal,
  ChangeDetectorRef,
  NgZone 
} from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
declare var bootstrap: any;

@Component({
  selector: 'app-get-website-list',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './get-website-list.html',
  styleUrl: './get-website-list.css',
})
export class GetWebsiteList implements OnInit {
  websiteList = signal<any[]>([]);
  motherPanelId: any;
  selectedPanelDetailId: string | null = null;
  editPanelForm!: FormGroup;
  selectedPanelId: string | null = null;
  fileData: any = {};
  imagePreviews: any = {};
  userId: any;
  userName:any;
  motherPanelName:any;
  loading:any;

  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.motherPanelId = param.get('panelId');
      this.getUserData(this.motherPanelId)
      this.fetchWebsites(this.motherPanelId);
    });
    this.editPanelForm = this.fb.group({
      website_name: [''],
      website_url: ['', [Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
      refresh_endpoint_url: [
        '',
        [Validators.pattern(/^(http|https):\/\/[^ "]+$/)],
      ],
      website_logo_variant: [''],
      website_logo_variant_second: [''],
      website_logo_web_variant: [''],
      website_logo_mobile_variant: [''],
      website_favicon_variant: [''],
    });
  }

  fetchWebsites(id: any) {
    this.loading = true
    this.apiService.getWebsiteList(id).subscribe((res: any) => {
      this.loading = false
      this.websiteList.set(res.data);
    },
      (err) => {
        this.loading = false;
        console.error('Failed to fetch users', err);
      });
  }

  refreshComponent(id:any): void {
    console.log("refreshComponent")
    const currentUrl = this.router.url;
    this.apiService.refreshPanelDeatails(id).subscribe((res:any)=>{
      console.log(res);
      if (res) {
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate([currentUrl]);
          });
      }
    })
  }

  async confirmAndDeleteUser(userId: string) {
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;
    this.loading = true

    this.apiService.deleteWebsite(userId).subscribe({
      next: () => {
        this.loading = false
        this.showToast('User deleted successfully');
        this.fetchWebsites(this.motherPanelId); // refresh list
      },
      error: () => {
        this.loading = false
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
        this.loading = true;
        this.cd.detectChanges();
        setTimeout(()=>{

          const file: File = result.value;
          
          const formData = new FormData();
          formData.append('banner', file);
          // formData.append('panelDetailId',this.selectedPanelDetailId || '' );
          formData.append('image_type', 'image'); // hardcoded as you said
          // formData.append('banner_variant', 'default'); // optional if backend sets default
          
          // 👇 Now call your uploadBanner API
          this.uploadBanner(formData);
        })
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
        <input type="file" accept=".csv,text/csv" style="font-size:1rem;width: 100%;border-radius: 10px;margin-top: 3px" id="bannerImage" class="swal2-file" accept=".csv" />
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

  uploadBanner(formData: FormData){
    this.loading = true;
    // Replace with your service call
    this.apiService
    .addBanner(this.selectedPanelDetailId, formData)
    .pipe(finalize(() => {
      this.ngZone.run(()=>{
        this.loading = false;
        this.cd.detectChanges()
      })
    }))
    .subscribe({
      next: () => {
        this.showToast('Banner Added successfully')
      },
      error: (err) => {
        console.error('Error uploading banner:', err);
        this.showToast('Something went wrong!',true)
      },
    });
  }

  openEditPanelModal(panel: any) {
    this.selectedPanelId = panel._id;

    this.editPanelForm.patchValue({
      website_name: panel.website_name || '',
      website_url: panel.website_url || '',
      refresh_endpoint_url: panel.refresh_endpoint_url || '',
      website_logo_variant: panel.website_logo_variant || '',
      website_logo_variant_second: panel.website_logo_variant_second || '',
      website_logo_web_variant: panel.website_logo_web_variant || '',
      website_logo_mobile_variant: panel.website_logo_mobile_variant || '',
      website_favicon_variant: panel.website_favicon_variant || '',
    });

    this.imagePreviews = {
      website_logo: panel.website_logo
        ? `${panel.userId.cloud_image_url}${panel.website_logo}/${panel.website_logo_variant}`
        : null,
      website_logo_second: panel.website_logo_second
        ? `${panel.userId.cloud_image_url}${panel.website_logo_second}/${panel.website_logo_variant_second}`
        : null,  
      website_logo_web: panel.website_logo_web
        ? `${panel.userId.cloud_image_url}${panel.website_logo_web}/${panel.website_logo_web_variant}`
        : null,
      website_logo_mobile: panel.website_logo_mobile
        ? `${panel.userId.cloud_image_url}${panel.website_logo_mobile}/${panel.website_logo_mobile_variant}`
        : null,
      website_favicon: panel.website_favicon
        ? `${panel.userId.cloud_image_url}${panel.website_favicon}/${panel.website_favicon_variant}`
        : null,
    };

    this.fileData = {};

    const modalEl = document.getElementById('editPanelModal');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.fileData[field] = file;
    }
  }

  onSubmitEditPanel(): void {
    if (!this.selectedPanelId || this.editPanelForm.invalid) return;

    const formData = new FormData();

    Object.entries(this.editPanelForm.value).forEach(([key, value]) => {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        formData.append(key, String(value));
      }
    });

    [
      'website_logo',
      'website_logo_second',
      'website_logo_web',
      'website_logo_mobile',
      'website_favicon',
    ].forEach((field) => {
      if (this.fileData[field]) {
        formData.append(field, this.fileData[field]);
      }
    });

    const modalEl = document.getElementById('editPanelModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl!);
    modalInstance?.hide();
    this.loading = true;

    this.apiService
      .updateWebsite(this.selectedPanelId, formData)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.showToast('Website updated successfully')

          // const modalEl = document.getElementById('editPanelModal');
          // const modalInstance = bootstrap.Modal.getInstance(modalEl!);
          // modalInstance?.hide();

          this.editPanelForm.reset();
          this.fileData = {};
          this.fetchWebsites(this.motherPanelId); // refetch the list if needed
        },
        error: (err) => {
          this.loading = false;
          this.showToast('Update failed',true)
        },
      });
  }

  getUserData(id: any) {
    this.loading = true
    this.apiService
      .getMotherPanelList(id)
      .subscribe((res: any) => {
        this.loading = false
        this.userId = res?.data?.userId?._id
        this.userName = res?.data?.userId?.username
        this.motherPanelName = res?.data?.mother_panel
      },
      (err) => {
        this.loading = false;
        console.error('Failed to fetch users', err);
      });
  }
}
