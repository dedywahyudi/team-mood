import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { TeamProvider } from '../../providers/team/team';

import { TODAY } from '../../config';
import { eq } from '../../util';

/**
 * Team page - list all user's teams
 */

@IonicPage()
@Component({
  selector: 'page-teams',
  templateUrl: 'teams.html',
})
export class TeamsPage {
  // list with user teams
  public teams = [];
  // list with user teams that report to him
  public myTeams = [];

  // starting day of the voting data
  public startDay;

  // currently selected date
  private selectedDate = null;

  constructor(private navCtrl: NavController, private teamsProvider: TeamProvider) {}

  ngOnInit() {
    // fetch data for today
    this.fetchData(TODAY);
  }

  /**
   * fetchData Fetch my teams data for passed date
   * @param {date} date
   */
  fetchData(date?) {
    // do nothing if date is already selected
    if (eq(this.selectedDate, date)) {
      return;
    }

    // fetch team data
    this.teamsProvider.getMyTeams(date).subscribe(({ teams, startDay }) => {
      this.teams = teams.filter(team => !team.reportToMe);
      this.myTeams = teams.filter(team => team.reportToMe);

      this.startDay = startDay;
    });

    // mark date as selected
    this.selectedDate = date;
  }

  /**
   * index TrackBy index function
   * @param {any} index
   */
  index(index) {
    return index;
  }

  /**
   * navigate Navigate to specified page
   * @param {any} team
   * @param {string} section
   */
  navigate(team, section) {
    this.navCtrl.push('TeamReportPage', {team, section, date: this.selectedDate});
  }
}
