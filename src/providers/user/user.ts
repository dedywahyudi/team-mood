import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { uniqBy } from 'lodash';
import 'rxjs/add/operator/catch';

import { TODAY, API } from '../../config';
import { eq, _day } from '../../util';

// for DEMO purpose ONLY
// create a "local" storage to save user votes for current session
const storage = {votes: []};

@Injectable()
export class UserProvider {
  constructor(public http: HttpClient) {}

  /**
   * getCurrent Get current user's data
   */
  getCurrentUser() {
    return this.http.get(`${API.baseUrl}/user${API.format}`)
      // combine api user data with local session data
      .map((data: any) => ({...data, votes: uniqBy(
        [...storage.votes, ...data.votes],
        ({ date }) => _day(date),
      )}))
      .catch(e => (console.warn('Couldn\'t fetch data!', e), []));
  }

  /**
   * addVote Save a user vote
   * @param {any} vote
   */
  addVote(vote) {
    storage.votes = storage.votes
      .filter(v => !eq(v.date, TODAY))
      .concat({...vote, date: TODAY});
  }
}
