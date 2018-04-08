import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import { combineLatest } from 'rxjs/observable/combineLatest';

import { TODAY, API } from '../../config';
import { _day, eq } from '../../util';

// local in-memory cache
const cache = {};

// create a index list for the value of each mood
const MOOD_INDEX = {
  'very sad': -2,
  'sad': -1,
  'neutral': 0,
  'happy': 1,
  'very happy': 2,
};

/**
 * TeamsProvider - fetch team data from api
 */

@Injectable()
export class TeamProvider {
  public moodIndex = MOOD_INDEX;

  constructor(public http: HttpClient) {}

  /**
   * fetch Fetch data from api and cache the resposne
   * @param {string} url
   */
  fetch(url) {
    if (cache[url]) {
      return cache[url];
    }

    cache[url] = new BehaviorSubject(null).filter(d => d !== null);

    this.http.get(`${API.baseUrl}/${url}${API.format}`)
      .catch(e => (console.warn('Couldn\'t fetch teams data!', e), []))
      .subscribe(d => cache[url].next(d));

    return cache[url];
  }

  /**
   * getTeamReport Fetch report data for a specified team
   * @param {string} team The team id for which we get the report data
   * @param {date} date The date for which to fetch the data
   */
  getTeamReport(team, date?) {
    return this.getMyTeams(date)
      .map(data => ({...data, team: data.teams.find(({id}) => id === team)}));
  }

  /**
   * getMyTeams Get all teams for current user
   * @param {Date} date The date or date interval for which to fetch the data
   */
  getMyTeams(date = TODAY) {
    let interval = [_day(date), _day(date)];
    if (Array.isArray(date)) {
      interval = [_day(date[0]), _day(date[1])];
    }

    const [start, end] = interval;

    return combineLatest(
      this.fetch('my-teams'),
      this.fetch('teams-votes'),
     ).map(([teams, voting]) => {
        const votes = voting.data.filter(v => _day(v.date) >= start && _day(v.date) <= end);
        const getTeamVotes = (team) => (
          votes.map(({ date, teams }) => teams[team.id].map(v => ({...v, date}))));

        return {
          ...voting.meta,
          teams: teams.map(team => ({...team, votes: getTeamVotes(team)})),
        };
      });
  }

  /**
   * getTeamByMood Get the happiest/saddest team for the specified date
   * @param {string} mood Specify which team to get (happiest/saddest)
   * @param {any}    date The date for which to get the team
   */
  getTeamByMood(mood: string, date) {
    const today = _day(date || TODAY);

    return this.fetch(`${mood}-team`)
      .map(data => data.find(item => eq(item.date, today)));
  }

  /**
   * getWeeklyDigest Get the weekly digets items for the user's teams
   */
  getWeeklyDigest() {
    return this.fetch('weekly-digest');
  }
}
