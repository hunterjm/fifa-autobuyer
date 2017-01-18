import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { app } from './app';
import { account } from './account';
import { player } from './player';
import { settings } from './settings';
import { bid } from './bid';

const rootReducer = combineReducers({
  app,
  account,
  player,
  settings,
  bid,
  routing
});

export default rootReducer;
