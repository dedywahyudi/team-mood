import { flattenDeep } from 'lodash';
import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';

import { MOODS_LIST } from '../../config';
import { eq } from '../../util';
import { TeamProvider } from '../../providers/team/team';

/**
 * Team report page
 */

@IonicPage({
  segment: 'teams/:team',
})
@Component({
  selector: 'page-team-report',
  templateUrl: 'team-report.html',
})
export class TeamReportPage {
  @ViewChild('commentsEl') commentsEl: ElementRef;
  @ViewChild(Content) content: Content;

  // the starting day when we have data available
  public startDay;

  // current data for team
  public teamData: any = {};
  // comments added by team
  public comments = [];

  // all the available moods
  public moods = [...MOODS_LIST];

  // available view modes
  public viewModes = ['day', 'week', 'month', 'ytd'];
  // select the day view by default
  public viewMode = 0;
  // view the bar chart by default
  public viewLineChart = false;

  // selected interval to view data
  public interval;
  // selected date to view data
  public selectedDate;

  // the top offset of the comments section
  public commentsOffset = Math.min();
  // show the summary version of the header
  public summaryHeader = false;

  // get the team for which we show data from nav params
  get team() {
    return this.navParams.get('team');
  }

  constructor(
    private nav: NavController,
    private navParams: NavParams,
    private teams: TeamProvider,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const selectedDate = this.navParams.get('date');

    // fetch data on init
    this.fetchData(selectedDate);
  }

  ionViewDidEnter() {
    // get the comments section top offset
    this.commentsOffset = this.commentsEl.nativeElement.offsetTop;

    // check if need to scroll to comments section
    const section = this.navParams.get('section');
    if (section === 'comments') {
      this.content.scrollTo(0, this.commentsOffset, 250);
    }
  }

  /**
   * fetchData Fetch team data for specified date
   * @param {date} date
   */
  fetchData(date?) {
    // do nothing if date already selected
    if (eq(this.selectedDate, date)) {
      return;
    }

    // fetch team data
    this.teams.getTeamReport(this.team, date).subscribe(data => {
      this.startDay = data.startDay;
      this.teamData = data.team;

      // create the comments list
      const comments = flattenDeep(flattenDeep(this.teamData.votes).map(data =>
        data.feedback.map(feedback => ({...data, feedback}))));

      // update the comments, flat array
      setTimeout(() => this.comments = comments);
    });

    // reset selected interval & date, and update with the selected one
    this.interval = this.selectedDate = null;
    Array.isArray(date) ? this.interval = date : this.selectedDate = date;
  }

  /**
   * goBack Go back to teams page
   */
  goBack() {
    this.nav.push('TeamsPage');
  }

  /**
   * changeViewMode Change the view mode
   * @param {number} viewMode The view mode
   */
  changeViewMode(viewMode) {
    if (viewMode === this.viewMode) {
      return;
    }

    // disable view modes for month & ytd
    if (viewMode > 1) {
      return;
    }

    // reset team data
    this.teamData.votes = [];
    this.viewLineChart = false;
    this.viewMode = viewMode;
  }

  /**
   * scrollHandler Handle content scroll event
   * @param {ScollEvent}
   */
  scrollHandler({ scrollTop }) {
    // check if content is scrolled close to the comments section
    const isSummary = (this.commentsOffset - 5) <= scrollTop;

    // show the summary version of the header
    if (isSummary !== this.summaryHeader) {
      this.summaryHeader = isSummary;
      this.cd.detectChanges();

      // resize the ion content
      this.content.resize();
    }
  }

  /**
   * getFm Get data format for interval
   * @param {date} start
   * @param {date} end
   */
  getFm([start, end]) {
    return start.getMonth() !== end.getMonth() ? 'MMM d' : 'd';
  }
}
