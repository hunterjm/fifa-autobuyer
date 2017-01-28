import _ from 'lodash';
import Fut from 'fut-promise';
import request from 'request';
import Promise from 'bluebird';
import * as types from './playerTypes';
import metrics from '../utils/MetricsUtil';
import { getApi } from '../utils/ApiUtil';

const ENDPOINT = 'https://www.easports.com/uk/fifa/ultimate-team/api';
let searchReq = null;

export function search(query, page = 1) {
  return async dispatch => {
    if (searchReq) {
      searchReq.abort();
      searchReq = null;
    }

    return new Promise((resolve, reject) => {
      searchReq = request.get(
        {
          url: `${ENDPOINT}/fut/item?`,
          qs: { jsonParamObject: JSON.stringify({ page, name: query }) }
        },
        (error, response, body) => {
          if (error) {
            reject(error);
          }
          const json = JSON.parse(body);
          if (response.statusCode === 200) {
            metrics.track('Player Search', {
              query,
              results: json.totalResults
            });
            resolve(json);
          }
        }
      );
    }).then(results => {
      dispatch({ type: types.SAVE_SEARCH_RESULTS, results });
    });
  };
}

export function findPrice(id, buy = 0, num = 0) {
  return async (dispatch, getState) => {
    const { account, player, settings } = getState();
    const api = getApi(account.email);
    if (api) {
      const filter = { definitionId: id, num: 50 };
      if (buy) {
        filter.maxb = buy;
      }
      let lowest = buy;
      let total = num;
      const response = await api.search(filter);
      const prices = response.auctionInfo.map(i => i.buyNowPrice);
      if (prices.length) {
        lowest = Math.min(...prices);
        prices.filter(i => i.buyNowPrice === lowest);
        total = prices.length;
        // If we have 50 of the same result, go one lower
        if (total === 50) {
          lowest = Fut.calculateNextLowerPrice(lowest);
        }
      }
      if ((buy === 0 && prices.length) || lowest < buy) {
        await dispatch(findPrice(id, lowest, total));
      } else {
        const price = {
          lowest,
          total,
          buy: _.get(player, `list.${id}.price.buy`, 0),
          sell: _.get(player, `list.${id}.price.sell`, 0),
          bin: _.get(player, `list.${id}.price.bin`, 0),
          updated: Date.now(),
        };
        const mergedSettings = _.merge(settings, player.settings || {});
        if (mergedSettings.autoUpdate) {
          price.buy = Fut.calculateValidPrice(price.lowest * (settings.buy / 100));
          price.sell = Fut.calculateValidPrice(price.lowest * (settings.sell / 100));
          price.bin = Fut.calculateValidPrice(price.lowest * (settings.bin / 100));
          // If there are more than 10, go one price point lower
          if (price.total > 10) {
            price.buy = Fut.calculateNextLowerPrice(price.buy);
            price.sell = Fut.calculateNextLowerPrice(price.sell);
            price.bin = Fut.calculateNextLowerPrice(price.bin);
          }
          // If we are trying to sell for the same as buy, increment sell
          if (price.buy >= price.sell) {
            price.sell = Fut.calculateNextHigherPrice(price.buy);
          }
          if (price.sell >= price.bin) {
            price.bin = Fut.calculateNextHigherPrice(price.sell);
          }
        }
        dispatch(setPrice(id, price));
      }
    }
  };
}

export function setPrice(id, price) {
  return { type: types.SET_PRICE, id, price };
}

export function setSetting(id, key, value) {
  return { type: types.SET_SETTING, id, key, value };
}

export function add(player) {
  metrics.track('Add Player', {
    id: player.id,
    name: player.name
  });
  return { type: types.ADD_PLAYER, player };
}

export function remove(player) {
  metrics.track('Remove Player', {
    id: player.id,
    name: player.name
  });
  return { type: types.REMOVE_PLAYER, player };
}

export function clear() {
  return { type: types.CLEAR_LIST };
}
