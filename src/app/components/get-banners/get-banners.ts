import { Component,OnInit,signal } from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-banners',
  imports: [CommonModule,RouterModule],
  templateUrl: './get-banners.html',
  styleUrl: './get-banners.css'
})
export class GetBanners implements OnInit{

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
      console.log(this.panelDetailId, 'this.panelDetailId');
      this.fetchBanners(this.panelDetailId);
    });
  }

  fetchBanners(id:any){
    this.apiService.getBanners(id).subscribe((res:any)=>{
      this.bannerList.set(res.data);
      console.log(this.bannerList(),"banner list")
    })
  }
}
