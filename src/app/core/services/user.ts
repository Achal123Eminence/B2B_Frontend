import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class User {
  
  private token: string = '';

  setToken(token: string) {
    this.token = token;
    // localStorage.setItem('auth_token', token);
  }

  getToken():string{
    // return this.token || localStorage.getItem('auth_token') || '';
    return this.token;

  }
}
