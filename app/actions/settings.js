import * as types from './settingsTypes';

export function setSetting(key, value) {
  return { type: types.SET_SETTING, key, value };
}

export { setSetting as default };
