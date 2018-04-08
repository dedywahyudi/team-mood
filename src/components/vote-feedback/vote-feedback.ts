import { ModalController } from 'ionic-angular';
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { CommentBoxComponent } from '../comment-box/comment-box';

/**
 * Component to allow user to add a comment/feedback to his mood selection
 */

@Component({
  selector: 'vote-feedback',
  templateUrl: 'vote-feedback.html'
})
export class VoteFeedbackComponent {
  /**
   * mood The user-selected mood
   * @type {string}
   */
  @Input() mood = '';

  /**
   * comment Event triggered when user entered a comment
   * @type {Array<any>}
   */
  @Output() comment: EventEmitter<string> = new EventEmitter;

  constructor(private modalCtrl: ModalController) {}

  /**
   * showCommentModal Show the modal to input a comment
   * @param {string} type The type of the modal (text|audio)
   */
  showCommentModal(type) {
    const modal = this.modalCtrl.create(CommentBoxComponent, {type});
    modal.present();

    modal.onWillDismiss(comment => (comment !== undefined) && this.send(comment));
  }

  /**
   * send Emit the comment event
   * @param {string} comment Comment that user has added
   */
  send(comment = '') {
    this.comment.emit(comment);
  }
}
