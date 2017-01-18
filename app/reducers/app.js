import _ from 'lodash';

const initialState = {
  updates: {
    pending: false,
    update: false,
    downloaded: false,
    message: '',
  }
};

export function app(state = initialState, action) {
  let nextState;
  switch (action.type) {
    case 'app/set/updates':
      nextState = _.merge({}, state);
      _.set(nextState, 'updates', action.updates);
      return nextState;
    default:
      return state;
  }
}

export { app as default };
