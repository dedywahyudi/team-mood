import { Scroll } from 'ionic-angular';
import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { TODAY } from '../../config';
import { DAY, _day } from '../../util';
const today = _day(TODAY);

/**
 * Display a scrollable list with a date interval
 * and allow user to select a specific week
 */

@Component({
  selector: 'week-selector',
  templateUrl: 'week-selector.html'
})
export class WeekSelectorComponent {
  @ViewChild('scrollEl') scrollEl: Scroll;

  /**
   * color The color of the buttons (dark|light)
   * @type {string}
   */
  @Input() color = 'light';

  /**
   * start The start date of the interval
   * @type {date|number|string|null}
   */
  @Input() start;

  /**
   * end The end date of the interval
   * @type {date|number|string|null}
   */
  @Input() end = today;

  /**
   * select Event emitted when one week is selected
   * @type {Array<Date, Date>}
   */
  @Output() select: EventEmitter<any> = new EventEmitter;

  // store teh selected week's index
  public selected;

  // the weeks list that will be rendered
  public interval = [];

  ngOnChanges({ start, end }) {
    if ((start || end) && this.start !== undefined) {
      this.updateInterval();
    }
  }

  /**
   * scrollNav Scroll navigation element to last element
   */
  scrollNav(){
    const el = this.scrollEl._scrollContent.nativeElement;
    el.scrollLeft += el.scrollWidth;
  }

  /**
   * updateInterval Update the rendered interval list based on last inputs
   */
  updateInterval() {
    let start = _day(this.start);
    let end = _day(this.end);

    // if starting day of the  interval is different than Monday,
    // re-calculate it and get closest Monday
    if (new Date(start).getDay() !== 1) {
      start = start - (new Date(start).getDay() - 1) * DAY;
    }

    // if ending day of the  interval is different than Friday,
    // re-calculate it and get closest Friday
    if (new Date(end).getDay() !== 5) {
      end = end + (5 - new Date(start).getDay()) * DAY;
    }

    // loop the interval from start to end, and create a list with
    // the starting & ending days of each week in the interval
    this.interval = [];
    while (start < end) {
      this.interval.push([new Date(start), new Date(start + 4 * DAY)]);
      start += 7 * DAY;
    }

    setTimeout(() => {
      // wait to exit render loop,
      // and scroll to last element
      this.scrollNav();

      // wait exit current ng change detection loop,
      // and notify with the selected interval
      this.doSelect(this.interval.length - 1);
    });
  }

  /**
   * doSelect Mark passed week as selected and emit a select event
   * @param {number} index The index of the selected week
   */
  doSelect(index) {
    this.selected = index;
    this.select.emit(this.interval[index]);
  }

  /**
   * getFm Get the date formatting for the passed interval
   * @param {Date} start
   * @param {Date} end
   */
  getFm([start, end]) {
    return start.getMonth() !== end.getMonth() ? 'MMM d' : 'd';
  }
}
