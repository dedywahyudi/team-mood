import { Scroll } from 'ionic-angular';
import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { TODAY } from '../../config';
import { _day, eq, expand } from '../../util';
const today = _day(TODAY);

/**
 * Display a scrollable list with a date interval
 * and allow user to select a specific date
 */

@Component({
  selector: 'date-selector',
  templateUrl: 'date-selector.html'
})
export class DateSelectorComponent {
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
   * selectedDate The date to select initially
   * @type {date}
   */
  @Input() public selectedDate;

  // store teh selected date
  public selected = today;

  /**
   * select Event emitted when one date is selected
   * @type {number}
   */
  @Output() select: EventEmitter<any> = new EventEmitter;

  // the days list that will be rendered
  public interval = [];

  ngOnInit() {
    this.selected = this.selectedDate;
  }

  ngOnChanges({ start, end }) {
    // update the dates if start or end updated & there's a valid interval
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
    const initDate = _day(this.start);
    const endDate = _day(this.end);

    // create an interval between today and first day of voting, map days to Date objects
    this.interval = expand([initDate, endDate])
      // filter out the weekend days
      .filter(d => d.getDay() >= 1 && d.getDay() <= 5)
      // reverse the days interval
      .reverse();

    setTimeout(() => {
      // wait to exit render loop,
      // and scroll to last element
      this.scrollNav();

      // wait exit current ng change detection loop,
      // and notify with the selected interval
      this.doSelect(this.selected || this.end);
    });
  }

  /**
   * doSelect Mark passed day as selected and emit a select event
   * @param {number} day The selected day
   */
  doSelect(day) {
    this.selected = day;
    this.select.emit(day);
  }

  /**
   * isSelected Check if passed day is selected
   * @param {number} day The day to be checked
   */
  isSelected(day) {
    return eq(this.selected, day);
  }
}
