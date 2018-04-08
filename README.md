# Team Mood app

### Prerequisite
Make sure you have the following in order to be able to run/build the project:
> node >= 8.x
> npm >= 5.x
> [ionic](https://www.npmjs.com/package/ionic) >= 3.20: `npm i -g ionic`
> [cordova](https://www.npmjs.com/package/cordova) >= 8.0: `npm i -g cordova`


For android you'll need:
> [Java JDK](http://www.oracle.com/technetwork/java/javase/downloads/index-jsp-138363.html) recommended jdk 1.8
> [Android Studio](https://developer.android.com/studio/index.html) recommended 3.0
> Updated Android SDK tools, platform and component dependencies. Available through Android Studi's [SDK Manager](https://developer.android.com/studio/intro/update.html)

For iOS you'll need:
> Xcode 7 or higher
> iOS 9
> A free [Apple ID](https://appleid.apple.com/) or paid Apple Developer account

Make sure you get familiar with Ionic Framework: http://ionicframework.com/getting-started/ & http://ionicframework.com/docs/ .

### App Configurations
You can find some basic configurations for the application in `src/config.ts` as follows:
> `API`: the api baseUrl & format used to fetch data from
> `TODAY`: set a custom date as "today" so you can test the application more easily. Leave as `new Date` by default.
> `animationDuration`: duration for the application's animations (default: 750ms)
> `MOODS_LIST`: A list used by app to render the moods. Recommended to not change it, as many areas aren't supposed to change.

All application data is to be found under `src/assets/data` as `json` files.

All the resources/assets required to build the application are to be found in `resources`. You'll find a README file in there if you need to rebuild the assets.

### Building the project/applications for iOS and Android
Check [Ionic's deployment guide](https://ionicframework.com/docs/intro/deploying/) for more details.

Go to project and run:
> `ionic cordova platform add android` or `ionic cordova platform add ios` type `Y` when asked to install dependencies.

> To run your app on Android, all you have to do is enable USB debugging and Developer Mode on your Android device, then run `ionic cordova run android --device` from the command line.

> To build your app for Android, run `ionic cordova build android --prod` from the command line.

To build your app for iOS:
***NOTE*** First update `ios-deploy` to >= 1.9.2 if you have used ionic-cordova before: `npm i -g ios-deploy`

> run `ionic cordova build ios --prod`.
> Open the .xcodeproj file in platforms/ios/ in Xcode
> Connect your phone via USB and select it as the run target
> Click the play button in Xcode to try to run your app

**NOTE**: If you find a signing while building/running your app, check https://ionicframework.com/docs/intro/deploying/ for more details.
**NOTE**: If you get `Error: Cannot find module '@ionic/app-scripts'` while running any of the above commands, please run `npm install` and the before command again (there's a bug where the `app-scripts` package gets removed).

### Testing the application
The packed application files for Android and iOS can be found in the `apk` folder:
> `android.apk` the debug version of the app
> `Team Mood.app` the version for the iOS app

To run the app on your device:
Android:
> Copy the .APK file to your device.
> Use file manager to locate the file.
> Then click on it.
> Android App installer should be one of the options in pop-up.
> Select it and it installs.
Or use adb: `adb install "name".apk file`.

Drag the iOS app over a simulator to install it.

To run the app on your device you’ll need to sign up for an Apple Developer account to test as a native app on an iPhone or iPad. Unfortunately, this costs $99 per year (don’t blame us!). Once you have an account and you have set up Xcode with your certificates to enable device testing, you’ll want to open the Xcode project from platforms/ios/ and do your testing from Xcode.

Here are further instructions explained in detail about how to publish the apps: https://ionicframework.com/docs/v1/guide/publishing.html .

DEMO VIDEO: https://youtu.be/_z0TJZEKcho

### 3rd party libraries, plugins, frameworks
> [ionic](https://www.npmjs.com/package/ionic)
> [cordova](https://www.npmjs.com/package/cordova)
> [angular2](angular.io)
> [ionic-plugin-keyboard] Auto included by ionic/cordova for building the app
> [cordova-plugin-whitelist] Auto included by ionic/cordova for building the app
> [cordova-plugin-device] Auto included by ionic/cordova for building the app
> [cordova-plugin-splashscreen] Auto included by ionic/cordova for building the app
> [cordova-plugin-ionic] Auto included by ionic/cordova for building the app
> [cordova-plugin-screen] Auto included by ionic/cordova for building the app
