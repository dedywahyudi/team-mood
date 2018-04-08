import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Content } from 'ionic-angular';

import { range } from 'lodash';
import { combineLatest } from 'rxjs/observable/combineLatest';

import { TODAY } from '../../config';
import { _day, eq, DAY } from '../../util';
const today = _day(TODAY);

import { UserProvider } from '../../providers/user/user';
import { TeamProvider } from '../../providers/team/team';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  @ViewChild(Content) content: Content;

  // store the weekday of today
  public today = TODAY.getDay();

  // indexes for week days
  public weekDays = range(1, 6);

  // names for each week day
  public weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // the team weekly digest content
  public digest$;

  // current user
  public user;

  // moodiest teams
  public happiestTeam;
  public saddestTeam;

  // the selected day to show status for
  public selectedDay;

  constructor(public navCtrl: NavController, private teams: TeamProvider, private users: UserProvider) {}

  ngOnInit() {
    this.getTeams();

    // get current user from api
    this.users.getCurrentUser().subscribe(user => this.user = user);

    // get weekly digest content
    this.digest$ = this.teams.getWeeklyDigest();
  }

  /**
   * dayToDate Convert a week day to an actual date
   * @param {number} day The day to be converted
   *
   * @returns {date} Actually date as time number
   */
  dayToDate(day) {
    return _day(today - (this.today - day) * DAY);
  }

  /**
   * getTeams Get the moodiest teams for the specified day
   * @param {date} day The day for which we should fetch the teamm
   */
  getTeams(day?) {
    this.selectedDay = day || this.today;
    const date = this.dayToDate(this.selectedDay);

    combineLatest(
      this.teams.getTeamByMood('happiest', date),
      this.teams.getTeamByMood('saddest', date)
    ).subscribe(teams => {
      this.happiestTeam = teams[0];
      this.saddestTeam = teams[1];
    });
  }

  /**
   * getMood Get the user voted mood for the passed day
   * @param {date} day
   *
   * @returns {any} The user vote for the day
   */
  getMood(day) {
    if (!this.user) {
      return;
    }

    const date = this.dayToDate(day);
    return this.user.votes.find(v => eq(v.date, date)) || {};
  }

  /**
   * chooseDay Select a day and fetch data for it
   * @param {date} day
   */
  chooseDay(day) {
    const date = this.dayToDate(day);

    // do nothing if day:
    // - is future day
    // - day was voted
    if (!eq(today, date) && (this.getMood(day).mood || day > this.today)) {
      return;
    }

    this.getTeams(day);
  }

  /**
   * navigate Navigate to specified page
   * @param {string} page
   */
  navigate(page: string) {
    this.navCtrl.push(page);
  }

  /**
   * ionViewDidEnter Re-calculate the ion content's height on page enter
   */
  ionViewDidEnter() {
    setTimeout(() => this.content.resize());
  }
}
