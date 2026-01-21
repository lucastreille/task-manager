import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { getErrorMessage } from '../../../shared/utils/error-message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = '';

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: LoginRequest = this.form.getRawValue();

    this.auth.login(payload).subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: (err: unknown) => {
        console.log('LOGIN ERROR', err);
        this.error = getErrorMessage(err, 'Login failed');
      },
    });
  }
}
