import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api-service';
import { User } from '../../core/services/user';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit{
  loginForm!: FormGroup;
  errorMessage: string = '';
  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private UserService:User
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.apiService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          const token = res.token;
          if (token) {
            // localStorage.setItem('auth_token', token); // Save token
            this.UserService.setToken(token);
          }
          this.router.navigate(['/home'])
        },
        error: (err: any) => {
          this.errorMessage = err.error.message || 'Login failed';
        }
      });
    }
  }
  
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
