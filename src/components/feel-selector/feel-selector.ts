import { ModalController } from 'ionic-angular';
import { Component, ElementRef, ViewChild, Renderer, Output, EventEmitter } from '@angular/core';

import { MOODS_LIST } from '../../config';
import { CommentBoxComponent } from '../comment-box/comment-box';

// the area in which user can drag the handler freely
// defined by the "darker" round area within the selector
const X = 40;

@Component({
  selector: 'feel-selector',
  templateUrl: 'feel-selector.html'
})
export class FeelSelectorComponent {
  // horizontal ox axis - used to determine the
  // angle at which user drags the slider
  @ViewChild('oxAxis') oxAxis: ElementRef;

  @ViewChild('slider') slider: ElementRef;
  @ViewChild('track') track: ElementRef;

  /**
   * items Event emitted when one mood is selected
   * @type {string}
   */
  @Output() select: EventEmitter<string> = new EventEmitter;

  // available moods list
  options = [...MOODS_LIST];

  // will contain the "temporary" value selected by the user
  // (while running in the free-drag zone)
  onselect = null;

  // will contain the user selected value
  // while user is heading to the final - confirmation zone
  preselect = null;

  // will contain the user selected value when use got to the confirm zone
  selected = null;

  // value of the range slider
  value = 0;

  constructor(private renderer: Renderer, private modalCtrl: ModalController) {}

  ngAfterViewInit() {
    // start listening for drag start on the range input/slider
    this.slider.nativeElement.addEventListener('touchstart', this.onDragStart, false);
  }

  /**
   * getTheta Get the angle at which the user is dragging the handler
   * @param {any} box The mouse coordinates
   */
  getTheta(box) {
    const oxRect = this.oxAxis.nativeElement.getBoundingClientRect();

    let theta = Math.round(Math.atan((oxRect.top - box.y)/(oxRect.left - box.x)) * 180/Math.PI);
    theta = (theta + (box.x > oxRect.left ? 0 : -180)) || 0;

    return theta;
  }

  /**
   * onDragStart Start listening for drag move & drag events
   */
  onDragStart = () => {
    this.slider.nativeElement.addEventListener('touchmove', this.onDragging, false);
    this.slider.nativeElement.addEventListener('touchend', this.onDragEnd, false);
  }

  /**
   * onDragging
   * @param {TouchEvent} ev   TouchMove event
   */
  onDragging = (ev: TouchEvent) => {
    const {clientX, clientY} = ev.touches[0];
    const oxRect = this.oxAxis.nativeElement.getBoundingClientRect();

    // mouse coordinates
    const x = clientX;
    const y = Math.min(oxRect.top, clientY);

    // drag angle
    const theta = this.getTheta({x, y});
    // distance between origin & user mouse
    const dist = this.value;

    // if there's a selected option, make the free-running distance smaller
    const freeDragZone = X * (this.preselect !== null ? 0.1 : 1);

    // if user is in free-running zone, pre-select the track on which to run
    if (dist < freeDragZone) {
      const t = 180 - Math.abs(theta);
      this.onselect = Math.max(0, Math.min(4, Math.round(t/45)));
      this.preselect = null;
      this.selected = null;
    } else {
      // user exited free-running zone, confirm the pre-selected track
      this.preselect = this.onselect;
    }

    // if user entered confirm zone (reached end of track)
    // confirm make the selection
    if (dist >= 100) {
      this.onSelected(this.preselect);
    } else {
      // if exited the confirm zone, cancel the selection
      this.onSelected(null);
    }

    // rotate the track on which the user is dragging
    this.renderer.setElementStyle(this.track.nativeElement, 'transform', `rotate(${dist >= freeDragZone ? this.preselect*45 - 180 : theta}deg)`);
  }

  onDragEnd = () => {
    this.slider.nativeElement.removeEventListener('touchmove', this.onDragging);
    this.slider.nativeElement.removeEventListener('touchend', this.onDragEnd);

    // if no element was selected and user dropped the handler midway,
    // reset it and position it on the center
    if (this.selected === null) {
      this.renderer.setElementStyle(this.track.nativeElement, 'transform', 'rotate(0deg)');
      this.value = 0;

      this.onselect = null;
      this.preselect = null;
    } else {
      // user confirmed his selection, remove all listeners & emit select event
      this.slider.nativeElement.removeEventListener('touchstart', this.onDragStart);
      this.renderer.setElementStyle(this.slider.nativeElement, 'display', 'none');

      this.select.emit(this.options[this.selected]);
    }
  }

  /**
   * onSelected Confirm user selection, by storing the value
   * @param {number} selected
   */
  onSelected(selected) {
    this.selected = selected;
  }

  /**
   * voiceSelect Accept user-voice commands to select a mood
   * @param {string} option The user-voice command for mood
   */
  voiceSelect(option = '') {
    const index = this.options.indexOf(option.trim().toLowerCase());

    if (index === -1) {
      return; //no mood matching user-command
    }

    this.preselect = index;
    this.onSelected(index);
    this.onDragEnd();
  }

  /**
   * showAudioModal Show the modal that lets the user select mood via audio-input
   */
  showAudioModal() {
    const modal = this.modalCtrl.create(CommentBoxComponent, {type: 'audio'});
    modal.present();

    modal.onWillDismiss(this.voiceSelect.bind(this));
  }
}
