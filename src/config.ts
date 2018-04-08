/**
 * App configuration file
 */

// config for api location
export const API = {
  baseUrl: './assets/data',
  format: '.json', // set to empty string if no format is needed
};

// set a custom date as "TODAY"'s date
// usefull to test the application
export const TODAY = new Date('2018-03-06');

// duration for the application's animations
// default is 750ms
export const animationDuration = 750;

// the application's mood list
export const MOODS_LIST = ['very sad', 'sad', 'neutral', 'happy', 'very happy'];
