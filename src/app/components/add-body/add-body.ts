import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule,FormArray } from '@angular/forms';
import Swal from 'sweetalert2';
import { ApiService } from '../../core/services/api-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { single } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-add-body',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-body.html',
  styleUrl: './add-body.css'
})
export class AddBody implements OnInit {

  panelDetailId: any;
  loading = false;
  websiteName: any;
  addBodyForm!: FormGroup;
  folderList = signal<any[]>([]);

  selectedBodyId: string | null = null;
  previewImage: string | null = null;
  imageUrl: string | null = null;
  folders: any[] = [];
  selectedImageUrls: string[] = [];

  constructor(
    private apiService: ApiService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.activeRoute.paramMap.subscribe((param: any) => {
      this.panelDetailId = param.get('panelDetailsId');
    });
    this.addBodyForm = this.fb.group({
      bodyRows: this.fb.array([this.createBodyRow()]),
    });

    this.getFolderList(); // To populate dropdown
  }
  get bodyRows(): FormArray {
    return this.addBodyForm.get('bodyRows') as FormArray;
  }

  createBodyRow(): FormGroup {
    return this.fb.group({
      folderId: ['', Validators.required],
      image: [null, Validators.required],
      imagePosition: ['', Validators.required],
      imageClass: ['entrance-half', Validators.required], // small by default
      bodyVariant: [''],
    });
  }

  addRow(): void {
    this.bodyRows.push(this.createBodyRow());
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

  removeRow(index: number): void {
    this.bodyRows.removeAt(index);
  }

  onImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.bodyRows.at(index).patchValue({ image: file });
    }
  }

onSubmit(): void {
  console.log(this.addBodyForm.value,"this.addBodyForm.value")
  if (this.addBodyForm.invalid) {
    Swal.fire('Error', 'Please fill all required fields', 'error');
    return;
  }

  this.loading = true;

  const requests = this.bodyRows.controls.map((row) => {
    const data = row.value;
    const formData = new FormData();
    formData.append('folderId', data.folderId);
    formData.append('imagePosition', data.imagePosition);
    formData.append('imageClass', data.imageClass);
    formData.append('bodyVariant', data.bodyVariant || '');
    if (data.image) {
      formData.append('image', data.image);
    }

    console.log(formData,":formData")
    return this.apiService.addBody(this.panelDetailId, formData);
  });

  // Run requests one by one (sequentially)
  let index = 0;
  const processNext = () => {
    if (index < requests.length) {
      requests[index].subscribe({
        next: () => {
          index++;
          processNext();
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', `Failed to add row ${index + 1}`, 'error');
        }
      });
    } else {
      this.loading = false;
      Swal.fire('Success', 'All rows added successfully', 'success');
      this.addBodyForm.reset();
      this.bodyRows.clear();
      this.addRow(); // Keep one empty row
    }
  };

  processNext();
}


  onFolderChange(i: number) {
  const folderId = this.bodyRows.at(i).get('folderId')?.value;
  const folder = this.folderList().find(f => f._id === folderId);
  this.selectedImageUrls[i] = folder ? folder.image_url : '';
}
}
