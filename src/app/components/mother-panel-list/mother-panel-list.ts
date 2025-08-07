import { Component,OnInit, signal,inject } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-mother-panel-list',
  imports: [RouterModule,CommonModule],
  templateUrl: './mother-panel-list.html',
  styleUrl: './mother-panel-list.css',
})
export class MotherPanelList implements OnInit {
  private router = inject(Router);
  motherPanelList = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getmotherPanel();
  }

  getmotherPanel() {
    this.apiService.getMotherPanelList().subscribe((res: any) => {
      this.motherPanelList.set(res?.data?.items || []);
      console.log(this.motherPanelList());
    });
  }

  async confirmAndDeleteMotherPanel(mId: string) {
    console.log("delete hit")
    const confirmed = await this.showConfirmation();
    if (!confirmed) return;

    this.apiService.deleteMotherPanel(mId).subscribe({
      next: () => {
        this.showToast('Mother Panel deleted successfully');
        this.getmotherPanel(); // refresh list
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

    addWebsite(id:any){
      console.log(id,"add web hit")
      this.router.navigate([`add-website/${id}`]);
    }

    getWebsite(id:any){
      console.log(id,"add web hit")
      this.router.navigate([`website-list/${id}`]);
    }
}
