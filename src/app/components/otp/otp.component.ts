import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  code = signal<string | undefined>(undefined);
  error = signal<string | null>(null);
  isValid = signal(this.form.valid);

  constructor() {
    this.form.statusChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isValid.set(this.form.valid);
    })
  }

  onSubmit() {
    const codeValue = this.form.get('code')?.value ?? '';
    this.code.set(codeValue);

    if (!this.form.valid) {
      this.error.set('Invalid OTP code. Please try again.');
      return;
    }

    this.error.set(null);
    alert('OTP accepted!');
  }
}
