import { Component, Input } from '@angular/core';

import { _day } from '../../util';

/**
 * Display a list of comments with their metadata (mood & date)
 */

@Component({
  selector: 'comments',
  templateUrl: 'comments.html'
})
export class CommentsComponent {
  /**
   * items The comments list to be rendered
   * @type {Array<any>}
   */
  @Input() comments = [];

  /**
   * showMoodName Show the name of the mood, not just the color
   * @type {boolean}
   */
  @Input() showMoodName = false;

  ngOnChanges(comments) {
    // if chomments input has changed, sort the comments list by date (newest first)
    if (comments && this.comments) {
      this.comments.sort((a, b) => (_day(a.date) - _day(b.date)) * -1);
    }
  }
}
