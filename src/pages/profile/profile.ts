import { Component } from '@angular/core';
import { IonicPage, ModalController } from 'ionic-angular';

import 'rxjs/add/operator/share';

import { MOODS_LIST } from '../../config';
import { UserProvider } from '../../providers/user/user';
import { CommentBoxComponent } from '../../components/comment-box/comment-box';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  // current user
  public user: any = {};

  // data for the profile chart
  public chartData = [];

  // the available moods list
  public moods = [...MOODS_LIST].reverse();

  constructor(private users: UserProvider, public modalCtrl: ModalController) {}

  ngOnInit() {
    // fetch user on init
    this.users.getCurrentUser().subscribe((user) => {
      this.user = { ...user };
      this.updateChartData();
    });
  }

  /**
   * openFeedbackModal Open modal for user to add a feedback
   */
  openFeedbackModal() {
    const modal = this.modalCtrl.create(CommentBoxComponent, {feedback: true});
    modal.present();
  }

  /**
   * updateChartData Update the chart data according to selected date
   * @param {date} year = 'YTD' The year to show the data for
   */
  updateChartData(year = 'YTD') {
    const y = year === 'YTD' ? new Date().getFullYear().toString() : year
    const start = new Date(y);
    const end = new Date((+y + 1).toString());

    this.chartData = this.user.votes.filter((vote) => {
      const date = new Date(vote.date);
      return date >= start && date < end;
    });
  }
}
