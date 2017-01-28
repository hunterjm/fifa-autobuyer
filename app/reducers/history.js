import _ from 'lodash';
import * as bidTypes from '../actions/bidTypes';

export function history(state = {}, action) {
  switch (action.type) {
    case bidTypes.UPDATE_PLAYER_HISTORY: {
      const nextState = _.merge({}, state);
      const item = {};
      item[action.history.id] = action.history;
      _.set(nextState, action.id, _.merge(
        {}, _.get(nextState, action.id, {}), item
      ));
      return nextState;
    }
    default:
      return state;
  }
}

export { history as default };
