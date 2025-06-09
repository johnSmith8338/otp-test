import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  email = signal<string | undefined>('');

  isValid = signal(this.form.valid);

  constructor() {
    this.form.statusChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isValid.set(this.form.valid);
    });
  }

  get emailControl() {
    return this.form.get('email');
  }

  onSubmit() {
    if (this.form.valid) {
      const email = this.emailControl?.value ?? '';
      // this.router.navigate(['/otp']);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      this.http.post('http://localhost:3000/send-otp', { email, otp }).subscribe({
        next: () => {
          localStorage.setItem('otp', otp);
          localStorage.setItem('email', email);
          this.router.navigate(['/otp']);
        },
        error: () => {
          alert('Send OTP - rejected');
        }
      })
    }
  }
}
