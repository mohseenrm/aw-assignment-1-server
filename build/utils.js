'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var generateLoginEvent = exports.generateLoginEvent = function generateLoginEvent() {
  return {
    type: 'login',
    timeStamp: new Date().getTime()
  };
};