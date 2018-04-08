import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

import { HomePage } from '../../pages/home/home';

/**
 * Footer of the application/page
 */

@Component({
  selector: 'page-footer',
  templateUrl: 'page-footer.html'
})
export class PageFooterComponent {
  /**
   * active The input items for the chart
   * @type {string}
   */
  @Input() active;

  constructor(private nav: NavController) {}

  /**
   * navigate Navigate to specified page
   * @param {string} page
   */
  navigate(page: string) {
    this.nav.push(page || HomePage);
  }
}
