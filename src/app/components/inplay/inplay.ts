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
import { fork } from 'child_process';

@Component({
  selector: 'app-inplay',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inplay.html',
  styleUrl: './inplay.css',
})
export class Inplay implements OnInit {
  @ViewChild('cricket') cricket!: ElementRef;
  @ViewChild('virtual') virtual!: ElementRef;
  @ViewChild('football') football!: ElementRef;
  @ViewChild('tennis') tennis!: ElementRef;
  addInplayForm!: FormGroup;
  apiError: string | null = null;
  panelDetailsId: any;
  panelDetailsName: any;
  userId:any;
  panelId:any;
  fileData: any = {};
  loading = false;
  inplayData:any;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.panelDetailsId = param.get('panelDetailsId');
      this.getPanelDetailsData(this.panelDetailsId);
      this.getInplayData(this.panelDetailsId);
    });
    // Inplay Form
    this.addInplayForm = this.fb.group({
      cricket_variant:[''],
      virtual_variant:[''],
      football_variant:[''],
      tennis_variant:[''],
    })
  }

  getInplayData(id: any) {
    this.apiService.getInplay(id).subscribe(
      (res: any) => {
        this.loading = false;
        this.inplayData = res.data;
        if(this.inplayData){
          this.addInplayForm.patchValue({
            cricket_variant: this.inplayData.cricket_variant,
            virtual_variant: this.inplayData.virtual_variant,
            football_variant: this.inplayData.football_variant,
            tennis_variant: this.inplayData.tennis_variant,
          });
        }
      },
      (err) => {
        this.loading = false;
        console.error('Failed to get inplay details', err);
      }
    );
  }



  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.fileData[field] = file;
    }
  }

  onSubmit() {
    if(this.addInplayForm.invalid){
      this.addInplayForm.markAllAsTouched();
      return;
    };

    const formData = new FormData();
    formData.append('userId',this.userId);
    formData.append('panelDetailsId',this.panelDetailsId);
    formData.append('cricket_variant',this.addInplayForm.value.cricket_variant);
    formData.append('virtual_variant',this.addInplayForm.value.virtual_variant);
    formData.append('football_variant',this.addInplayForm.value.football_variant);
    formData.append('tennis_variant',this.addInplayForm.value.tennis_variant);

    // Append files
    [
      'cricket_image',
      'virtual_image',
      'football_image',
      'tennis_image'
    ].forEach((field) => {
      if (this.fileData[field]) {
        formData.append(field, this.fileData[field]);
      }
    });

    // this.loading = true;

    this.apiService.addInplay(formData).subscribe({
      next: (res) => {
        this.loading = false; 
        console.log(res,"add inplay api")
        this.showToast('Website  Created successfully');
        this.addInplayForm.reset();
        this.fileData = {};
        this.resetFileInputs();
        this.getInplayData(this.panelDetailsId);
      },
      error: (err) => {
        this.loading = false; 
        this.showToast('Failed to Create Website', true);
        console.error('Website creation failed:', err);
      },
    });
  }

  onCancel() {
    this.addInplayForm.reset();
    this.fileData = {};
    this.resetFileInputs(); // ✅ Clear file input fields
  }

  resetFileInputs() {
    if (this.cricket) this.cricket.nativeElement.value = null;
    if (this.virtual) this.virtual.nativeElement.value = null;
    if (this.football) this.football.nativeElement.value = null;
    if (this.tennis) this.tennis.nativeElement.value = null;
  }

  getPanelDetailsData(id: any) {
    // this.loading = true;
    this.apiService.getSingleWebsiteList(id).subscribe(
      (res: any) => {
        this.loading = false;
        console.log(res.data,"res.data")
        this.panelDetailsName = res.data.website_name;
        this.userId = res.data.userId;
        this.panelId = res.data.panelId._id;
      },
      (err) => {
        this.loading = false;
        this.showToast('Failed to get panel details', true);
        console.error('Failed to get panel details', err);
      }
    );
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
