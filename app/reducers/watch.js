import _ from 'lodash';
import * as types from '../actions/watchTypes';

export const initialState = {
  watching: false,
  trades: {}
};

export function watch(state = initialState, action) {
  let nextState;
  switch (action.type) {
    case types.START_WATCHING:
      nextState = _.merge({}, state, { watching: true });
      return nextState;
    case types.STOP_WATCHING:
      nextState = _.merge({}, state, { watching: false });
      return nextState;
    case types.SET_WATCH:
      nextState = _.merge({}, state);
      _.set(nextState, `trades.${action.id}`, action.trades);
      return nextState;
    case types.CLEAR_WATCH:
      nextState = _.merge({}, state);
      _.set(nextState, `trades.${action.id}`, {});
      return nextState;
    default:
      return state;
  }
}

export { watch as default };
