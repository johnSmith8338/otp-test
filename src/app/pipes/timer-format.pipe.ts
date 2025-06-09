import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'timerFormat',
  standalone: true,
})
export class TimerFormatPipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    const totalSeconds = Math.max(0, value ?? 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  }

}
