import _ from 'lodash';
import * as types from './watchTypes';
import { getApi } from '../utils/ApiUtil';
import { setCredits } from './account';

const filter = {
  type: 'player',
  num: 50,
};

let cycleTimeout;

const search = async (api, player, page = 0) => {
  const searchFilter = _.merge({}, filter, {
    definitionId: player.id,
    start: page
  });
  let searchResults = 0;
  let last20Min = [];
  try {
    const searchResponse = await api.search(searchFilter);
    searchResults = searchResponse.auctionInfo.length;
    last20Min = _.filter(searchResponse.auctionInfo, trade => trade.expires <= 1200);
  } catch (e) {
    console.error(`Error watching auctions for ${player.name}`, e); // eslint-disable-line
  }
  if (searchResults > 0 && last20Min.length === searchResults) {
    // Increment page and search again
    last20Min = last20Min.concat(await search(api, player, page + 51));
  }
  return last20Min;
};

export function start(player) {
  return async (dispatch, getState) => {
    dispatch({ type: types.START_WATCHING });
    dispatch(clearWatched(player.id));
    const state = getState();
    const api = getApi(state.account.email);
    const watched = await search(api, player);
    await dispatch(setWatched(player.id, _.keyBy(watched, 'tradeId')));
    await dispatch(cycle(player));
  };
}

export function clearWatched(id) {
  return { type: types.CLEAR_WATCH, id };
}

export function setWatched(id, trades) {
  return { type: types.SET_WATCH, id, trades };
}

export function cycle(player) {
  return async (dispatch, getState) => {
    const state = getState();
    const api = getApi(state.account.email);
    const tradeIds = Object.keys(_.get(state.watch, `trades[${player.id}]`, {}));
    if (state.watch.watching && tradeIds.length) {
      let statuses;
      try {
        statuses = await api.getStatus(tradeIds);
        dispatch(setCredits(statuses.credits));
      } catch (e) {
        console.error(`Error getting trade statuses: ${JSON.stringify(tradeIds)}`, e); // eslint-disable-line
        statuses = { auctionInfo: [] };
      }
      dispatch(setWatched(player.id, _.keyBy(statuses.auctionInfo, 'tradeId')));
      const active = _.filter(statuses.auctionInfo, trade => trade.expires > 0);
      if (active.length) {
        cycleTimeout = window.setTimeout(() => {
          dispatch(cycle(player));
        }, 10000);
      }
    }
  };
}

export function stop() {
  if (cycleTimeout) {
    window.clearTimeout(cycleTimeout);
    cycleTimeout = undefined;
  }
  return { type: types.STOP_WATCHING };
}
