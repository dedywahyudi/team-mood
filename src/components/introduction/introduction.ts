import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

/**
 * Introduction modal explaining the interface when
 * user lands first time in the app
 */

@Component({
  selector: 'introduction',
  templateUrl: 'introduction.html'
})
export class IntroductionComponent {
  constructor(public viewCtrl: ViewController) {}

  /**
   * dismiss Dismiss self
   */
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
