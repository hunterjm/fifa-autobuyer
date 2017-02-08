import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import { app } from './app';
import { account } from './account';
import { player } from './player';
import { history } from './history';
import { settings } from './settings';
import { bid } from './bid';
import { watch } from './watch';

const rootReducer = combineReducers({
  app,
  account,
  player,
  history,
  settings,
  bid,
  watch,
  routing
});

export default rootReducer;
