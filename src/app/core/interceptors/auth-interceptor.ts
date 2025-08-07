import { HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpEvent,HttpHandler,HttpInterceptor,HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiService } from '../services/api-service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { User } from '../services/user';



export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const userService = inject(User);
  const token = userService.getToken();
  const router = inject(Router);
  const api = inject(ApiService);

  console.log(token);
  // Clone and add Authorization header if token exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  console.log(authReq.headers.get('Authorization'), 'Authorization Header');
  console.log(authReq,"authReq")  
  return next(authReq).pipe(
    catchError((error) => {
      console.log(error,"error")
      console.log(error.status,"error.status");
      if (error.status === 401 || error.status === 403) {
        api.logout(); // Clear user state
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
