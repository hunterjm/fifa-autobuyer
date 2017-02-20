import _ from 'lodash';
import * as types from '../actions/settingsTypes';

export const initialState = {
  rpm: '10',
  minCredits: '1000',
  maxCard: '10',
  autoStop: '0',
  snipeOnly: false,
  bidUntilMin: 5,
  skipTutorial: false,
  autoUpdate: true,
  buy: '90',
  sell: '100',
  bin: '110',
  relistAll: false
};

export function settings(state = initialState, action) {
  let nextState;
  switch (action.type) {
    case types.SET_SETTING:
      nextState = _.merge({}, state);
      nextState[action.key] = action.value;
      return nextState;
    default:
      return state;
  }
}

export { settings as default };
