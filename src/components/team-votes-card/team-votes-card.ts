import { Component, Input, Output, EventEmitter } from '@angular/core';

import { MOODS_LIST } from '../../config';

/**
 * Teams voted counter card
 * displayed on my-teams page
 */

@Component({
  selector: 'team-votes-card',
  templateUrl: 'team-votes-card.html'
})
export class TeamVotesCardComponent {
  /**
   * team The team used to render the card
   * @type {any}
   */
  @Input() team;

  /**
   * showComments Event emitted when user clicks the comment icon
   * @type {any}
   */
  @Output() showComments: EventEmitter<any> = new EventEmitter;

  // the votes list of the team
  public votes = [];

  // the total votes count of the team
  public votesCount = 0;

  // the mood which was voted the most
  public greatest = '';

  // comments counter
  public comments = 0;

  ngOnChanges() {
    if (this.team) {
      const teamVotes = ((this.team.votes || [])[0] || []);

      // get the top-voted mood
      this.greatest = teamVotes.reduce((p, vote) => {
        return p.count >= vote.count ? p : vote;
      }, {});

      // get the votes list & the votes count
      const votes = teamVotes.reduce((p, vote) => (p[vote.mood] = vote.count, p), {});
      this.votes = MOODS_LIST.map(mood => ({mood, count: votes[mood] || 0}));
      this.votesCount = teamVotes.reduce((sum, v) => sum + v.count, 0)
      this.comments = teamVotes.reduce((s, c) => s + c.feedback.length, 0);
    }
  }

  /**
   * index TrackBy function used to identify list elements in an ngFor
   * @param {number} index
   */
  index(index) {
    return index;
  }

  /**
   * seeComments Trigger the showComments Event
   * @param {MouseEvent} $event
   */
  seeComments($event: MouseEvent)  {
    $event.stopPropagation();
    this.showComments.emit();
  }
}
