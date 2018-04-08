import { ViewController, NavParams } from 'ionic-angular';
import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import { SpeechRecognition } from '@ionic-native/speech-recognition';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';

/**
 * Modal that lets user type in some text or use
 * voice recognition to input the feedback/text
 */

@Component({
  selector: 'comment-box',
  templateUrl: 'comment-box.html'
})
export class CommentBoxComponent {
  @ViewChild('textArea') textArea: ElementRef;

  // timeout for the android's speech restart
  private timeout;

  // save listening state
  public isListening = false;

  // options for the speech recognition object
  private speechOptions = {
    language: 'en-US',
    showPopup: false,
    showPartial: true,
  };

  // all the "final" matches of the speec recognition
  private matches = [];
  // partial matches of the recognition
  private partial = '';

  // get the final text
  get textComment() {
    return this.matches.concat(this.partial).join(' ').trim();
  }

  // get the modal type (audio|text)
  get type() {
    return this.navParams.get('type') || 'text';
  }

  // get if the modal is for the profile feedback
  get feedback() {
    return this.navParams.get('feedback') || false;
  }

  constructor(
    public viewCtrl: ViewController,
    private navParams: NavParams,
    private speechRecognition: SpeechRecognition,
    private cd: ChangeDetectorRef,
  ) {}

  ionViewDidEnter() {
    // start the speech recognition on modal load
    if (this.type === 'audio') {
      this.startListening();
    }

    // if is of type text, focus the textarea
    if (this.type === 'text') {
      setTimeout(() =>
        this.textArea.nativeElement.focus(), 450);
    }
  }

  ionViewDidLeave() {
    // stop the speech recognition on modal close
    if (this.type === 'audio') {
      this.stopListening();
    }
  }

  /**
   * stopListening Stop the recognizer
   */
  stopListening() {
    // mark listening state as false
    this.isListening = false;
    // do not restart the recognizer again
    clearTimeout(this.timeout);

    // stop the recognizer
    this.speechRecognition.stopListening();
  }

  /**
   * startListening Check for permissions & start the speech recognition
   */
  async startListening() {
    const hasPermission = await this.speechRecognition.hasPermission();

    // get permissions if none exists
    if (!hasPermission) {
      await this.speechRecognition.requestPermission();
    }

    // start the recognition
    this.isListening = true;
    this.doListen();
  }

  /**
   * doListen We do have permissions, start the recognition
   */
  doListen() {
    if (!this.isListening) {
      return;
    }

    // if we have some previous partial matches,
    // push them as "final" matches
    if (this.partial) {
      this.matches.push(this.partial);
      this.partial = '';
    }

    // start the recognition
    this.speechRecognition.startListening(this.speechOptions)
      // on final results, restart the recognition
      .finally(this.doListen.bind(this))
      // log if there are any errors
      .catch(e => (console.warn('Speech recognition error', e), []))

      // subscribe to results and store them
      .subscribe(matches => {
        this.partial = matches[0];
        this.cd.detectChanges();

        // restart the recognition after 1 second (necessary on android)
        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(this.doListen.bind(this), 1000);
      });
  }

  /**
   * dismiss Dismiss self
   * @param {string} query Pass a query to dismiss listeners
   */
  dismiss(query) {
    if (this.isListening) {
      this.stopListening();
    }

    this.viewCtrl.dismiss(query);
  }

  // check if keyboard is visible
  get keyboardIsVisible() {
    return (window['Keyboard'] || {}).isVisible;
  }
}
