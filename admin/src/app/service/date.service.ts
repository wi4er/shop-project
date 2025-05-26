import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }


  calculateTimeAgo(
    targetDate: string,
    currentDate: Date = new Date(),
  ): string {
    const diffInMs = currentDate.getTime() - new Date(targetDate).getTime();

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const days = Math.floor(diffInSeconds / (3600 * 24));
    const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    let result = '';
    if (days > 0) {
      result += `${days} дн. `;
    }
    if (hours > 0 || days > 0) {
      result += `${hours} ч. `;
    }
    result += `${minutes} мин. назад`;

    return result.trim();
  }

}
