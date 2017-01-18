import _ from 'lodash';
import * as types from '../actions/accountTypes';

const initialState = {
  email: '',
  password: '',
  secret: '',
  platform: ''
};

export function account(state = initialState, action) {
  let nextState;
  switch (action.type) {
    case types.SET_ACCOUNT_INFO:
      nextState = _.merge({}, state);
      nextState[action.key] = action.value;
      return nextState;
    case types.SET_CREDITS:
      return _.merge({}, state, {
        credits: action.credits
      });
    case types.SET_PILESIZE:
      nextState = _.merge({}, state);
      _.set(nextState, `pilesize.${action.key}`, action.value);
      return nextState;
    default:
      return state;
  }
}

export { account as default };
