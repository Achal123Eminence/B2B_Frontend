import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ApiService } from '../../core/services/api-service';
import { Router, ActivatedRoute,RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-webite',
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './add-webite.html',
  styleUrl: './add-webite.css',
})
export class AddWebite implements OnInit {
  @ViewChild('logoInput') logoInput!: ElementRef;
  @ViewChild('webInput') webInput!: ElementRef;
  @ViewChild('mobileInput') mobileInput!: ElementRef;
  @ViewChild('faviconInput') faviconInput!: ElementRef;
  addWebsiteForm!: FormGroup;
  apiError: string | null = null;
  motherPanelId: any;
  userId: any;
  userName:any;
  motherPanelName:any;
  fileData: any = {}; // To hold file inputs

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {
    
  }

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.motherPanelId = param.get('panelId');
      console.log(this.motherPanelId, 'this.motherPanelId');
      this.getUserData(this.motherPanelId);
    });
    this.addWebsiteForm = this.fb.group({
      website_name: ['', Validators.required],
      website_url: ['', [Validators.required,Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
      refresh_endpoint_url: [
        '',
        [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)],
      ],
      website_logo_variant:[''],
      website_logo_web_variant:[''],
      website_logo_mobile_variant:['']
    });
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.fileData[field] = file;
    }
  }

  onSubmit() {
    if (this.addWebsiteForm.invalid) {
      console.log("Form invalid", this.addWebsiteForm)
      this.addWebsiteForm.markAllAsTouched(); // ✅ Trigger validation display
      return;
    }

    console.log(this.addWebsiteForm,"this.addWebsiteForm",this.addWebsiteForm.value.website_logo_variant,"this.addWebsiteForm.value.website_logo_variant",this.addWebsiteForm.value.website_logo_web_variant,"this.addWebsiteForm.value.website_logo_web_variant",this.addWebsiteForm.value.website_logo_mobile_variant,"this.addWebsiteForm.value.website_logo_mobile_variant")

    const formData = new FormData();
    formData.append('userId', this.userId);
    formData.append('panelId', this.motherPanelId);

    formData.append('website_name', this.addWebsiteForm.value.website_name);
    formData.append('website_url', this.addWebsiteForm.value.website_url);
    formData.append('refresh_endpoint_url', this.addWebsiteForm.value.refresh_endpoint_url);

    formData.append('website_logo_variant', this.addWebsiteForm.value.website_logo_variant);
    formData.append('website_logo_web_variant', this.addWebsiteForm.value.website_logo_web_variant);
    formData.append('website_logo_mobile_variant', this.addWebsiteForm.value.website_logo_mobile_variant);


    console.log(formData,"formData");
    // Append files
    ['website_logo', 'website_logo_web', 'website_logo_mobile', 'website_favicon'].forEach(field => {
      if (this.fileData[field]) {
        formData.append(field, this.fileData[field]);
      }
    });

    console.log(formData, 'this.formData.value');
    this.apiService.addWebsite(formData).subscribe({
      next: (res) => {
        console.log('User created:', res);
        this.showToast('Website  Created successfully');
        this.addWebsiteForm.reset(); // ✅ Reset the form
        this.fileData = {};
        this.resetFileInputs(); // ✅ Clear file input fields
        // this.router.navigate(['/users-list']); // redirect to users list or any page
      },
      error: (err) => {
        this.showToast('Failed to Create Website', true);
        console.error('Website creation failed:', err);
      },
    });
  }

  onCancel() {
    this.addWebsiteForm.reset();
    this.fileData = {};
    this.resetFileInputs(); // ✅ Clear file input fields
  }

  get f() {
    return this.addWebsiteForm.controls;
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

  getUserData(id: any) {
    this.apiService
      .getMotherPanelList(this.motherPanelId)
      .subscribe((res: any) => {
        this.userId = res?.data?.userId?._id
        this.userName = res?.data?.userId?.username
        this.motherPanelName = res?.data?.mother_panel
        console.log(this.userId, this.userName, "this.userId, this.userName")
      });
  }

  resetFileInputs() {
  if (this.logoInput) this.logoInput.nativeElement.value = null;
  if (this.webInput) this.webInput.nativeElement.value = null;
  if (this.mobileInput) this.mobileInput.nativeElement.value = null;
  if (this.faviconInput) this.faviconInput.nativeElement.value = null;
}
}
