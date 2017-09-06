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

var generateLogoutEvent = exports.generateLogoutEvent = function generateLogoutEvent() {
  return {
    type: 'logout',
    timeStamp: new Date().getTime()
  };
};