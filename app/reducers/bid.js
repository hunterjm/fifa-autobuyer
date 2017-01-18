import _ from 'lodash';
import * as types from '../actions/bidTypes';

export const initialState = {
  bidding: false,
  cycles: 0,
  tradepile: [],
  watchlist: [],
  watched: {},
  listed: {},
  trades: {},
  unassigned: [],
  market: {
    data: [],
    flags: []
  },
  logs: []
};

export function bid(state = initialState, action) {
  let nextState;
  switch (action.type) {
    case types.START_BIDDING:
      nextState = _.merge({}, state, { bidding: true });
      return nextState;
    case types.STOP_BIDDING:
      nextState = _.merge({}, state, { bidding: false });
      return nextState;
    case types.ADD_MESSAGE:
      nextState = _.merge({}, state);
      nextState.logs.push(action.log);
      return nextState;
    case types.CLEAR_MESSAGES:
      nextState = _.merge({}, state);
      nextState.logs = [];
      return nextState;
    case types.SET_CYCLES:
      nextState = _.merge({}, state, { cycles: action.count });
      return nextState;
    case types.SET_WATCHLIST:
      nextState = _.merge({}, state);
      _.set(nextState, 'watchlist', action.watchlist);
      return nextState;
    case types.SET_TRADEPILE:
      nextState = _.merge({}, state);
      _.set(nextState, 'tradepile', action.tradepile);
      return nextState;
    case types.SET_UNASSIGNED:
      nextState = _.merge({}, state);
      _.set(nextState, 'unassigned', action.unassigned);
      return nextState;
    case types.SAVE_MARKET_DATA:
      nextState = _.merge({}, state);
      _.set(nextState, 'market', action.market);
      return nextState;
    case types.SET_WATCH:
      nextState = _.merge({}, state);
      _.set(nextState, 'watched', action.watched);
      return nextState;
    case types.UPDATE_WATCH:
      nextState = _.merge({}, state);
      _.set(nextState, `watched.${action.id}`, action.count);
      return nextState;
    case types.SET_LISTED:
      nextState = _.merge({}, state);
      _.set(nextState, 'listed', action.listed);
      return nextState;
    case types.UPDATE_LISTED:
      nextState = _.merge({}, state);
      _.set(nextState, `listed.${action.id}`, action.count);
      return nextState;
    case types.SET_TRADES:
      nextState = _.merge({}, state);
      _.set(nextState, 'trades', action.trades);
      return nextState;
    case types.UPDATE_TRADES:
      nextState = _.merge({}, state);
      _.set(nextState, `trades.${action.id}`, action.tradeResult);
      return nextState;
    case types.SET_BIN_STATUS:
      nextState = _.merge({}, state);
      _.set(nextState, 'binWon', action.won);
      return nextState;
    default:
      return state;
  }
}

export { bid as default };
