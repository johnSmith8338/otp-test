import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, OnDestroy, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TimerFormatPipe } from '../../pipes/timer-format.pipe';
import { interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    TimerFormatPipe,
  ],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtpComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  code = computed(() => this.form.get('code')?.value ?? '');
  email = signal('');
  error = signal<string | null>(null);
  isValid = signal(this.form.valid);
  isFocused = signal(false);
  @ViewChild('realInput') realInput!: ElementRef<HTMLInputElement>;

  readonly timerDuration = 6;
  readonly resendLimit = 3;
  timerSeconds = signal(this.timerDuration);
  canResend = signal(false);
  resendAttempts = signal(0);
  private timerSub!: Subscription;

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
    const savedEmail = localStorage.getItem('email');
    this.email.set(savedEmail ?? '');

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

    this.startTimer();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.focusInput();
      this.startTimer();
    });
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

    // if (!this.form.valid) {
    //   this.error.set('Invalid OTP code. Please try again.');
    //   return;
    // }

    // const codeValue = this.codeControl?.value ?? '';
    // this.error.set(null);

    // alert(`OTP accepted! ${codeValue}`);

    const enteredCode = this.codeControl?.value ?? '';
    const savedOtp = localStorage.getItem('otp');

    if (enteredCode === savedOtp) {
      alert('OTP accepted!');
      localStorage.removeItem('otp');
      localStorage.removeItem('email');
      this.error.set(null);
      // Link could be inserted for navigation after success
    } else {
      this.error.set('Incorrect OTP code. Please try again.');
    }
  }

  private startTimer() {
    this.canResend.set(false);
    this.timerSeconds.set(this.timerDuration);

    if (this.timerSub) this.timerSub.unsubscribe();

    this.timerSub = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const current = this.timerSeconds() - 1;
        this.timerSeconds.set(current);
        if (current <= 0) {
          this.timerSub.unsubscribe();
          this.canResend.set(true);
        }
      });
  }

  resendOtp() {
    if (this.resendAttempts() >= this.resendLimit) {
      this.error.set("You've reached the maximum number of resend attempts");
      return;
    }

    const email = localStorage.getItem('email');
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    this.http.post('http://localhost:3000/send-otp', { email, otp: newOtp }).subscribe({
      next: () => {
        localStorage.setItem('otp', newOtp);
        this.resendAttempts.set(this.resendAttempts() + 1);
        this.startTimer();
      },
      error: () => {
        this.error.set('Failed to resend OTP');
      }
    });
  }

  ngOnDestroy() {
    this.timerSub?.unsubscribe();
  }
}
