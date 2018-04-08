import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Storage } from '@ionic/storage';

import { HomePage } from '../pages/home/home';
import { VotePage } from '../pages/vote/vote';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    screenOrientation: ScreenOrientation,
    storage: Storage,
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.hide();
      splashScreen.hide();

      // lock in portrait view
      screenOrientation.lock(screenOrientation.ORIENTATIONS.PORTRAIT)
        .catch(e => {});

    });

    // check if user has seen the intro modal
    // if not, replace the rootPage with the VotePage
    storage.get('hasSeenIntroModal').then((hasSeenIntroModal) => {
      this.rootPage = hasSeenIntroModal ? HomePage : VotePage;
    });
  }
}

