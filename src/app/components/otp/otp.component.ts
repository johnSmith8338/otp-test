import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpComponent implements AfterViewInit {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  code = computed(() => this.form.get('code')?.value ?? '');
  error = signal<string | null>(null);
  isValid = signal(this.form.valid);
  isFocused = signal(false);
  @ViewChild('realInput') realInput!: ElementRef<HTMLInputElement>;

  get codeControl() {
    return this.form.get('code');
  }
  get codeValue() {
    return this.codeControl?.value ?? '';
  }
  get codeLength() {
    return (this.codeControl?.value ?? '').length;
  }

  constructor() {
    this.form.statusChanges.pipe(
      takeUntilDestroyed()
    ).subscribe(() => {
      this.isValid.set(this.form.valid);
    })
    this.codeControl?.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((value: string | null) => {
      const current = value ?? '';
      this.isValid.set(this.form.valid);
      if (current.length === 6 && this.form.valid) {
        this.onSubmit();
      }
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.focusInput());
  }

  focusInput() {
    this.realInput.nativeElement.focus();
  }

  onInput() {
    const raw = this.codeControl?.value ?? '';
    const clean = raw.replace(/\D/g, '').slice(0, 6);
    this.codeControl?.setValue(clean);
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.error.set('Invalid OTP code. Please try again.');
      return;
    }

    // const codeValue = this.codeControl?.value ?? '';
    // this.error.set(null);

    // alert(`OTP accepted! ${codeValue}`);

    const enteredCode = this.codeControl?.value ?? '';
    const savedOtp = localStorage.getItem('otp');

    if (enteredCode === savedOtp) {
      alert('OTP accepted!');
      localStorage.removeItem('otp');
      localStorage.removeItem('email');
      // Link could be inserted for navigation after success
    } else {
      this.error.set('Incorrect OTP code. Please try again.');
    }
  }
}
