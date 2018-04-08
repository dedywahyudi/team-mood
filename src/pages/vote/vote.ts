import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { HomePage } from '../home/home';
import { UserProvider } from '../../providers/user/user';
import { IntroductionComponent } from '../../components/introduction/introduction';

/**
 * VotePage - render a page to let user vote mood for the day
 */

@IonicPage()
@Component({
  selector: 'page-vote',
  templateUrl: 'vote.html',
})
export class VotePage implements OnInit{

  // page state
  public state = {
    user: null, // current user
    step: 'select-mood', // current step
    mood: null, // selected mood
    comment: '', // added comment
    hasIntroduction: false,
    modal: null,
  };

  constructor(
    public navCtrl: NavController,
    private users: UserProvider,
    public modalCtrl: ModalController,
    private storage: Storage
  ) {}

  ngOnInit() {
    // fetch user
    this.state.user = this.users.getCurrentUser();
  }

  ionViewDidEnter() {
    // check if user has viewed the intro modal, if not, show it
    this.storage.get('hasSeenIntroModal').then((hasSeenIntroModal) => {
      if (!hasSeenIntroModal) {
        this.openIntroductionModal();
        this.storage.set('hasSeenIntroModal', true);
      }
    });
  }

  /**
   * moodSelected Select the passed mood and redirect to mood feedback step
   * @param {string} mood
   */
  moodSelected(mood) {
    this.setState({mood});

    setTimeout(() => this.setState({step: 'feedback'}), 1500);
  }

  /**
   * comment Add a comment for the selected mood
   * @param {string} comment
   */
  comment(comment: string) {
    this.setState({comment});

    // send the vote to api
    this.users.addVote({feedback: this.state.comment, mood: this.state.mood});

    this.redirectHome();
  }

  /**
   * setState Update page step
   * @param {any} state
   */
  setState(state) {
    this.state = { ...this.state, ...state};
  }

  /**
   * redirectHome Redirect to homepage
   */
  redirectHome() {
    this.navCtrl.setRoot(HomePage, {}, { animate: true });
  }

  /**
   * openIntroductionModal Show the introduction modal
   */
  openIntroductionModal() {
    const modal = this.modalCtrl.create(IntroductionComponent);
    modal.present({animate: false});
    this.state.hasIntroduction = true;

    modal.onWillDismiss(() => this.state.hasIntroduction = false);
    this.setState({modal});
  }

  ionViewDidLeave() {
    // dismiss the modal on page leave
    if (this.state.modal) {
      this.state.modal.dismiss({}, {animate: false});
    }
  }
}
