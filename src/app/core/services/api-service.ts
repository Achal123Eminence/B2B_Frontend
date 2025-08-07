import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  login(obj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user/login`, obj);
  };

  logout(): void {
    // Clear any client-side user state here if needed
    // For example, clear localStorage or sessionStorage
    // localStorage.clear();
    // sessionStorage.clear();
    // Optionally, call a logout endpoint on the server if exists
    // this.http.post(`${this.baseUrl}/logout`, {}).subscribe();
  }

  getUserList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/get-user-list`)
  }

  createUser(data:any){
    return this.http.post(`${this.baseUrl}/user/register`,data);
  }

  deleteUser(id:any){
    return this.http.delete(`${this.baseUrl}/user/remove/${id}`);
  }

  getMotherPanelList(id?: string):Observable<any>{
    let params = new HttpParams();
    if (id) {
      params = params.set('_id', id);
    }
    return this.http.get(`${this.baseUrl}/mother-panel/get-list`,{ params })
  }

  deleteMotherPanel(id:any){
    return this.http.delete(`${this.baseUrl}/mother-panel/remove/${id}`);
  }

  createMotherPanel(data:any){
    return this.http.post(`${this.baseUrl}/mother-panel/create`,data)
  };

  addWebsite(data:any){
    return this.http.post(`${this.baseUrl}/details/createPanelDetails`,data);
  }

  getWebsiteList(id?: string):Observable<any>{
    let params = new HttpParams();
    if (id) {
      params = params.set('panelId', id);
    }
    return this.http.get(`${this.baseUrl}/details/getPanelDetails`,{ params })
  }

  deleteWebsite(id:any){
    return this.http.delete(`${this.baseUrl}/details/remove/${id}`);
  }

  getBanners(id:any){
    return this.http.get(`${this.baseUrl}/banner/get/${id}`)
  }

  addBanner(id:any,data:any){
    return this.http.post(`${this.baseUrl}/banner/add/${id}`,data);
  }
}
