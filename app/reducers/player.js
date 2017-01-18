import _ from 'lodash';
import * as types from '../actions/playerTypes';
import * as bidTypes from '../actions/bidTypes';

const initialState = {
  search: {},
  list: {}
};

export function player(state = initialState, action) {
  switch (action.type) {
    case types.SAVE_SEARCH_RESULTS: {
      const nextState = _.merge({}, state);
      _.set(nextState, 'search', action.results);
      return nextState;
    }
    case types.ADD_PLAYER: {
      const nextState = _.merge({}, state);
      _.set(nextState, `list.${_.get(action, 'player.id')}`, action.player);
      // Setup additional information
      _.set(nextState, `list.${_.get(action, 'player.id')}.price`, {});
      _.set(nextState, `list.${_.get(action, 'player.id')}.history`, {});
      return nextState;
    }
    case types.REMOVE_PLAYER: {
      const nextState = _.merge({}, state);
      _.unset(nextState, `list.${action.player.id}`);
      return nextState;
    }
    case types.CLEAR_LIST: {
      const nextState = _.merge({}, state);
      _.set(nextState, 'list', {});
      return nextState;
    }
    case types.SET_PRICE: {
      const nextState = _.merge({}, state);
      _.set(nextState, `list.${action.id}.price`, action.price);
      return nextState;
    }
    case bidTypes.UPDATE_PLAYER_HISTORY: {
      const nextState = _.merge({}, state);
      const history = {};
      history[action.history.id] = action.history;
      _.set(nextState, `list.${action.id}.history`, _.merge(
        {}, _.get(nextState, `list.${action.id}.history`, {}), history
      ));
      return nextState;
    }
    default:
      return state;
  }
}

export { player as default };
