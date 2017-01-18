import 'babel-polyfill';
import { jsdom } from 'jsdom';
import mockery from 'mockery';
import electron from './mocks/electron';

global.document = jsdom('<!doctype html><html><head></head><body></body></html>');
global.window = document.defaultView;
Object.keys(document.defaultView).forEach(property => {
  if (typeof global[property] === 'undefined') {
    global[property] = document.defaultView[property];
  }
});
global.navigator = global.window.navigator;
window.localStorage = window.sessionStorage = {
  getItem(key) {
    return this[key] || null;
  },
  setItem(key, value) {
    this[key] = JSON.stringify(value);
  },
  removeItem(key) {
    this[key] = undefined;
  },
};

// Mock Electron
mockery.enable({ warnOnUnregistered: false });
mockery.registerMock('electron', electron);
