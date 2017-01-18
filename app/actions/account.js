import { push } from 'react-router-redux';
import * as types from './accountTypes';
import { init, getApi } from '../utils/ApiUtil';
import metrics from '../utils/MetricsUtil';

export function setAccountInfo(key, value) {
  return { type: types.SET_ACCOUNT_INFO, key, value };
}

export function setCredits(credits) {
  return { type: types.SET_CREDITS, credits };
}

export function setPilesize(key, value) {
  return { type: types.SET_PILESIZE, key, value };
}

export function getCredits(email) {
  return async dispatch => {
    const api = getApi(email);
    if (api) {
      const result = await api.getCredits();
      dispatch(setCredits(result.credits));
    }
  };
}

export function getPilesize(email) {
  return async dispatch => {
    const piles = {
      2: 'tradepile',
      4: 'watchlist',
    };
    const api = getApi(email);
    const response = await api.getPilesize();
    for (const { key, value } of response.entries) {
      if (piles[key] !== undefined) {
        dispatch(setPilesize(piles[key], value));
      }
    }
  };
}

export function login(account, tfCb = () => {}, captchaCb = () => {}) {
  return async dispatch => {
    try {
      const apiClient = init(account, tfCb, captchaCb);
      await apiClient.login();
      metrics.track('Successful Login');
      dispatch(getCredits(account.email));
      dispatch(getPilesize(account.email));
      dispatch(push('/players'));
    } catch (e) {
      // this.setState({ twoFactor: false, loading: false, errors: { detail: e.message } });
      throw e;
    }
  };
}
