import _ from 'lodash';
import * as types from '../actions/playerTypes';

export const initialState = {
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
      _.set(nextState, `list.${_.get(action, 'player.id')}.settings`, {});
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
    case types.SET_SETTING: {
      const nextState = _.merge({}, state);
      if (action.value !== '') {
        _.set(nextState, `list.${action.id}.settings.${action.key}`, action.value);
      } else {
        _.unset(nextState, `list.${action.id}.settings.${action.key}`);
      }
      return nextState;
    }
    default:
      return state;
  }
}

export { player as default };
