import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TODAY } from '../../config';
import { eq, _day, DAY } from '../../util';

const today = _day(TODAY);
const yesterday = _day(+TODAY - DAY);

const isToday = (day) => eq(day, today);
const isYesterday = (day) => eq(day, yesterday);
const prefix = (day) => isToday(day) ? 'Today, ' : (isYesterday(day) ? 'Yesterday, ': '');

/**
 * dateFm Use the angular's default datePipe to format a date,
 * and prepend "yesterday" or "today" text to it
 */

@Pipe({
  name: 'dateFm',
})
export class DateFmPipe extends DatePipe implements PipeTransform {
  /**
   * Prepend the "yesterday" or "today" prefix to a date if necessary.
   */
  transform(value: string, ...args) {
    const formatted = super.transform(value, ...args);
    return `${prefix(value)}${formatted}`;
  }
}
