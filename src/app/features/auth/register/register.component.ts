import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ROLE, RegisterRequest } from '../../../core/models/auth.model';
import { getErrorMessage } from '../../../shared/utils/error-message';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  error = '';
  ROLE = ROLE;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [ROLE.USER, [Validators.required]],
  });

  submit(): void {
    this.error = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = this.form.getRawValue();

    this.auth.register(payload).subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: (err: unknown) => {
        console.log('REGISTER ERROR', err);
        this.error = getErrorMessage(err, 'Register failed');
      },
    });
  }
}
