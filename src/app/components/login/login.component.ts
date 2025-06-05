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

  onSubmit() {
    if (this.form.valid) {
      const email = this.form.get('email')?.value ?? '';
      this.router.navigate(['/otp']);
    }
  }
}
