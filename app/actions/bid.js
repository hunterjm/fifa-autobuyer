import _ from 'lodash';
import moment from 'moment';
import Fut from 'fut-promise';
import request from 'request';
import * as types from './bidTypes';
import cycle from './logic';
import { getApi } from '../utils/ApiUtil';
import { setCredits } from './account';
import { findPrice } from './player';

const filter = {
  type: 'player',
  start: 0,
  num: 16,
};

let cycleTimeout;
let marketRequest;

export function start() {
  return async dispatch => {
    dispatch({ type: types.START_BIDDING });
    dispatch(setCycleCount(0));
    dispatch(clearMessages());
    await dispatch(cycle());
  };
}

export function addMessage(level = 'log', msg, error = null) {
  return { type: types.ADD_MESSAGE, log: { level, msg: `[${moment().format('HH:mm:ss')}] ${msg}`, error } };
}

export function clearMessages() {
  return { type: types.CLEAR_MESSAGES };
}

export function setCycleCount(count = 0) {
  return { type: types.SET_CYCLES, count };
}

export function setWatched(watched) {
  return { type: types.SET_WATCH, watched };
}

export function updateWatched(id, count) {
  return { type: types.UPDATE_WATCH, id, count };
}

export function setListed(listed) {
  return { type: types.SET_LISTED, listed };
}

export function updateListed(id, count) {
  return { type: types.UPDATE_LISTED, id, count };
}

export function setTrades(trades) {
  return { type: types.SET_TRADES, trades };
}

export function updateTrades(id, tradeResult) {
  return { type: types.UPDATE_TRADES, id, tradeResult };
}

export function setBINStatus(won) {
  return { type: types.SET_BIN_STATUS, won };
}

export function snipe(player, settings) {
  return async (dispatch, getState) => {
    let state = getState();
    const api = getApi(state.account.email);
    dispatch(addMessage('log', `Preparing to snipe ${player.name}...`));
    // Snipe
    const binFilter = _.merge({}, filter, {
      definitionId: player.id,
      maxb: player.price.buy,
    });
    let binResponse;
    try {
      binResponse = await api.search(binFilter);
    } catch (e) {
      dispatch(addMessage('error', `Error searching for BIN on ${player.name}`, e));
      binResponse = { auctionInfo: [] };
    }
    dispatch(addMessage('log', `${binResponse.auctionInfo.length} BIN found for ${player.name}...`));
    for (const trade of binResponse.auctionInfo) {
      // refresh state every trade
      state = getState();
      if (
        // We are still bidding
        state.bid.bidding
        // We have enough credits
        && state.account.credits > settings.minCredits
        // We are below our cap for this player
        && _.get(state, `bid.listed.${player.id}`, 0) < settings.maxCard
        // The card has at least one contract
        && trade.itemData.contract > 0
      ) {
        // Buy it!
        let tradeResult = {};
        try {
          const snipeResponse = await api.placeBid(trade.tradeId, trade.buyNowPrice);
          dispatch(setCredits(snipeResponse.credits));
          tradeResult = _.get(snipeResponse, 'auctionInfo[0]', {});
        } catch (e) {
          dispatch(addMessage('error', `Error placing BIN bid $${trade.buyNowPrice} on ${player.name}`, e));
        }
        // tradeResult = {
        //   bidState: 'buyNow',
        //   tradeState: 'closed',
        //   tradeId: trade.tradeId,
        //   currentBid: trade.buyNowPrice
        // };
        // Was this a success?
        if (tradeResult.tradeState === 'closed' && tradeResult.bidState === 'buyNow') {
          dispatch(addMessage('success', `Bought for BIN (${trade.buyNowPrice}) on ${player.name}`));
          dispatch(setBINStatus(true));
          // Increment number of trades won
          if (state.bid.listed[player.id] === undefined) {
            dispatch(updateListed(player.id, 1));
          } else {
            dispatch(updateListed(player.id, state.bid.listed[player.id] + 1));
          }
        } else {
          // TODO: do something about this
          dispatch(addMessage('warn', `Could not snipe ${player.name}`));
        }
      }
    }
  };
}

export function placeBid(player, settings) {
  return async (dispatch, getState) => {
    if (!settings.snipeOnly) {
      let state = getState();
      const api = getApi(state.account.email);
      dispatch(addMessage('log', `Getting ready to search auctions for ${player.name}...`));
      const bidFilter = _.merge({}, filter, {
        definitionId: player.id,
        macr: player.price.buy,
      });
      let searchResults = 0;
      let last5Min = [];
      try {
        const bidResponse = await api.search(bidFilter);
        searchResults = bidResponse.auctionInfo.length;
        last5Min = _.filter(bidResponse.auctionInfo, trade => trade.expires <= 300);
      } catch (e) {
        dispatch(addMessage('error', `Error searching auctions for ${player.name}`, e));
      }
      dispatch(addMessage('log', `${searchResults} results (${last5Min.length} in last 5 minutes)`));
      if (searchResults > 0 && last5Min.length === searchResults) {
        // TODO: Increment page number and search again
      }
      for (const trade of last5Min) {
        // refresh state every trade
        state = getState();
        const listed = _.get(state.bid.listed, player.id, 0);
        if (
          // We are still bidding
          state.bid.bidding
          // We haven't placed too many bids
          // (Twice as many as max card - listed, assuming 50% win chance)
          && _.get(state.bid.watched, player.id, 0) < (settings.maxCard - listed) * 2
          // TODO: Keep track of how long we are inside this loop to set the
          //       lower limit, ensuring we do not attempt to bid on expired
          //       items.
          && trade.expires > 0
          // We have enough credits
          && state.account.credits > settings.minCredits
          // We are below our cap for this player
          && listed < settings.maxCard
          // We are not bidding on something that is already active in our watchlist
          && state.bid.trades[trade.tradeId] === undefined
          // The card has at least one contract
          && trade.itemData.contract > 0
        ) {
          // Set our bid
          let bid;
          if (trade.currentBid) {
            bid = Fut.calculateNextHigherPrice(trade.currentBid);
          } else {
            bid = trade.startingBid;
          }

          // Make sure we aren't trying to spend more than we want to
          if (bid <= player.price.buy) {
            // Bid!
            let tradeResult = {};
            try {
              const placeBidResponse = await api.placeBid(trade.tradeId, bid);
              dispatch(setCredits(placeBidResponse.credits));
              tradeResult = _.get(placeBidResponse, 'auctionInfo[0]', {});
            } catch (e) {
              dispatch(addMessage('error', `Error placing bid on ${player.name}`, e));
            }
            // tradeResult = {
            //   bidState: 'highest',
            //   tradeId: trade.tradeId,
            //   currentBid: bid
            // };
            // Was this a success?
            if (tradeResult.bidState === 'highest') {
              dispatch(addMessage('success', `Bidding ${bid} on ${player.name}`));
              // Add it to watched trades for listing and update our local watchlist
              dispatch(updateTrades(tradeResult.tradeId, tradeResult));
              state = getState();
              dispatch(setWatchlist(Object.values(state.bid.trades)));
              // Increment number of trades watched
              if (state.bid.watched[player.id] === undefined) {
                // state.bid.watched[player.id] = 1;
                dispatch(updateWatched(player.id, 1));
              } else {
                // state.bid.watched[player.id] += 1;
                dispatch(updateWatched(player.id, state.bid.watched[player.id] + 1));
              }
            } else {
              // TODO: do something about this
              dispatch(addMessage('warn', `Something happened when trying to bid on ${player.name}`));
            }
          } else {
            dispatch(addMessage('log', `Required bid (${bid}) is more than we are willing to pay for ${player.name} (${player.price.buy})`));
          }
        }
      }
    } else {
      dispatch(addMessage('warn', 'Skipping bidding, adjust settings to enable...'));
    }
  };
}


export function binNowToUnassigned() {
  return async (dispatch, getState) => {
    let state = getState();
    const api = getApi(state.account.email);
    if (state.bid.binWon) {
      dispatch(addMessage('log', 'Listing won BIN items...'));
      await dispatch(getUnassigned(state.account.email));
      state = getState();
      dispatch(setBINStatus(!!state.bid.unassigned.length));
      for (const i of state.bid.unassigned) {
        const baseId = Fut.getBaseId(i.resourceId);
        const trackedPlayer = _.get(state.player, `list.${baseId}`, false);
        if (trackedPlayer) {
          // Send it to the tradepile
          let pileResponse;
          try {
            pileResponse = await api.sendToTradepile(i.id);
          } catch (e) {
            dispatch(addMessage('error', 'Error sending won BIN to tradepile', e));
            pileResponse = { itemData: [{ success: false }] };
          }
          if (pileResponse.itemData[0].success) {
            try {
              await api.listItem(
                i.id,
                trackedPlayer.price.sell,
                trackedPlayer.price.bin,
                3600);
              // Increment number of trades won
              if (state.bid.listed[baseId] === undefined) {
                dispatch(updateListed(baseId, 1));
              } else {
                dispatch(updateListed(baseId, state.bid.listed[baseId] + 1));
              }
              dispatch(updateHistory(baseId, {
                id: i.id,
                bought: i.lastSalePrice,
                boughtAt: Date.now()
              }));
              dispatch(addMessage('success', `Listed ${trackedPlayer.name} for ${trackedPlayer.price.sell}/${trackedPlayer.price.bin}`));
            } catch (e) {
              dispatch(addMessage('error', 'Error listing won BIN for sale', e));
            }
          } else {
            dispatch(addMessage('warn', `Unable to send ${trackedPlayer.name} to tradepile...`));
          }
        }
      }
    }
  };
}

export function relistItems(settings) {
  return async (dispatch, getState) => {
    const state = getState();
    const api = getApi(state.account.email);
    const expired = state.bid.tradepile.filter(i => i.tradeState === 'expired');
    if (expired.length > 0) {
      dispatch(addMessage('log', 'Re-listing expired items...'));
      let relistFailed = false;
      if (settings.relistAll) {
        try {
          const relist = await api.relist();
          if (relist.code === 500) {
            relistFailed = true;
          }
        } catch (e) {
          dispatch(addMessage('error', 'Error attempting to relist all auctions', e));
          relistFailed = true;
        }
      }
      // Relist all failed? Do it manually.
      if (!settings.relistAll || relistFailed) {
        dispatch(addMessage('log', `Manually re-listing ${expired.length} players.`));
        for (const i of expired) {
          const baseId = Fut.getBaseId(i.itemData.resourceId);
          const priceDetails = _.get(state.player, `list.${baseId}.price`, false);
          try {
            if (!settings.relistAll && priceDetails) {
              await api.listItem(i.itemData.id, priceDetails.sell, priceDetails.bin, 3600);
            } else {
              await api.listItem(i.itemData.id, i.startingBid, i.buyNowPrice, 3600);
            }
          } catch (e) {
            dispatch(addMessage('error', 'Error manually re-listing player', e));
          }
        }
      }
    }
  };
}

export function logSold() {
  return async (dispatch, getState) => {
    const state = getState();
    const api = getApi(state.account.email);
    const sold = state.bid.tradepile.filter(i => i.tradeState === 'closed');

    if (sold.length > 0) {
      dispatch(addMessage('log', 'Removing sold items from tradepile...'));
      for (const i of sold) {
        // Is this a card we are tracking?
        const baseId = Fut.getBaseId(i.itemData.resourceId);
        const trackedPlayer = _.get(state.player, `list.${baseId}`, false);
        if (trackedPlayer) {
          dispatch(updateHistory(baseId, {
            id: i.itemData.id,
            sold: i.currentBid,
            soldAt: Date.now()
          }));
          dispatch(addMessage('success', `Sold ${trackedPlayer.name} for ${i.currentBid}!`));
        }
        try {
          await api.removeFromTradepile(i.tradeId);
        } catch (e) {
          dispatch(addMessage('error', 'Error removing sold item from tradepile', e));
        }
      }
      // Update tradepile when done
      await dispatch(getTradepile(state.account.email));
    }
  };
}

export function continueTracking(settings) {
  return async (dispatch, getState) => {
    let state = getState();
    const api = getApi(state.account.email);
    const tradeIds = Object.keys(state.bid.trades);
    if (!settings.snipeOnly && tradeIds.length) {
      dispatch(addMessage('log', `Updating status on ${tradeIds.length} active trades...`));
      let statuses;
      try {
        statuses = await api.getStatus(tradeIds);
        dispatch(setCredits(statuses.credits));
      } catch (e) {
        dispatch(addMessage('error', `Error getting trade statuses: ${JSON.stringify(tradeIds)}`, e));
        statuses = { auctionInfo: [] };
      }
      let newListed = false;
      for (const item of statuses.auctionInfo) {
        const baseId = Fut.getBaseId(state.bid.trades[item.tradeId].itemData.resourceId);
        const trackedPlayer = _.get(state.player, `list.${baseId}`, false);
        // Only continue if we are tracking this player, and know about this trade
        if (trackedPlayer && state.bid.trades[item.tradeId]) {
          // Handle Expired Items
          if (item.expires === -1) {
            if (item.bidState === 'highest') {
              // We won! Send to Pile!
              let pileResponse;
              try {
                pileResponse = await api.sendToTradepile(item.itemData.id);
              } catch (e) {
                dispatch(addMessage('error', 'Error sending won auction to tradepile', e));
                pileResponse = { itemData: [{ success: false }] };
              }
              if (pileResponse.itemData[0].success) {
                // List on market
                try {
                  await api.listItem(
                    item.itemData.id,
                    trackedPlayer.price.sell,
                    trackedPlayer.price.bin,
                    3600);
                  newListed = true;
                  // Increment number of trades won
                  if (state.bid.listed[baseId] === undefined) {
                    dispatch(updateListed(baseId, 1));
                  } else {
                    dispatch(updateListed(baseId, state.bid.listed[baseId] + 1));
                  }
                  dispatch(updateHistory(baseId, {
                    id: item.itemData.id,
                    bought: item.currentBid,
                    boughtAt: Date.now()
                  }));
                  dispatch(addMessage('success', `Listed ${trackedPlayer.name} for ${trackedPlayer.price.sell}/${trackedPlayer.price.bin}`));
                } catch (e) {
                  dispatch(addMessage('error', 'Error listing won auction for sale', e));
                }
              }
            } else {
              // Delete from watchlist, we lost
              try {
                await api.removeFromWatchlist(item.tradeId);
                const trades = state.bid.trades;
                delete trades[item.tradeId];
                dispatch(setWatchlist(Object.values(trades)));
                if (item.currentBid < trackedPlayer.price.buy) {
                  dispatch(addMessage('warn', `TOO SLOW: ${trackedPlayer.name} went for ${item.currentBid}`));
                } else {
                  dispatch(addMessage('log', `${trackedPlayer.name} sold for ${item.currentBid}, which is more than we want to pay`));
                }
              } catch (e) {
                dispatch(addMessage('error', 'Error removing lost auction from watchlist', e));
              }
            }
          } else if (item.bidState !== 'highest') {
            state = getState();
            // We were outbid
            const newBid = Fut.calculateNextHigherPrice(item.currentBid);
            const listed = _.get(state.bid.listed, baseId, 0);
            if (
              newBid > trackedPlayer.price.buy
              || listed >= settings.maxPlayer
            ) {
              // Remove from list if new bid is too high, or we already have too many listed
              try {
                await api.removeFromWatchlist(item.tradeId);
                const trades = state.bid.trades;
                delete trades[item.tradeId];
                dispatch(setWatchlist(Object.values(trades)));
                dispatch(addMessage('log', `${trackedPlayer.name} (${item.currentBid}) is either too expensive, or we have enough of them`));
              } catch (e) {
                dispatch(addMessage('error', 'Error removing outbid item from watchlist', e));
              }
            } else if (state.account.credits > settings.minCredits) {
              // Only continue if we have enough credits
              let tradeResult = {};
              try {
                const placeBidResponse = await api.placeBid(item.tradeId, newBid);
                dispatch(setCredits(placeBidResponse.credits));
                tradeResult = _.get(placeBidResponse, 'auctionInfo[0]', {});
              } catch (e) {
                dispatch(addMessage('error', 'Error placing additional bid on item', e));
              }
              if (tradeResult.bidState === 'highest') {
                dispatch(addMessage('success', `BIDDING WAR: Increased bid to ${newBid} on ${trackedPlayer.name}`));
              } else {
                // TODO: do something about this
                dispatch(addMessage('warn', `Something happened when trying to bid on ${tradeResult.tradeId}`));
              }
            } else {
              dispatch(addMessage('warn', `We do not have enough credits to continue bidding! Min Credit Limit: ${settings.minCredits}`));
            }
          }
        }
      }
      if (newListed) {
        // Update tradepile if we listed something here
        await dispatch(getTradepile(state.account.email));
      }
    }
  };
}

export function keepBidding() {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.bid.bidding) {
      if (
        // We don't have enough credits
        state.account.credits < state.settings.minCredits
        // We aren't watching any auctions
        && !state.bid.watchlist.length
        // We have some players listed
        && state.bid.tradepile.length
      ) {
        const timeout = state.bid.tradepile.reduce(
          (a, b) => (a < b.expires ? a : b.expires),
          60 // Wait a maximum of 60 seconds
        ) * 1000;
        dispatch(addMessage('log', `Waiting ${timeout / 1000} seconds before continuing...`));
        cycleTimeout = window.setTimeout(() => {
          dispatch(cycle());
        }, timeout);
      } else {
        await dispatch(cycle());
      }
    }
  };
}

export function updatePrice(player, settings) {
  return async dispatch => {
    const price = _.get(player, 'price', {});
    if (settings.autoUpdate) {
      const lastUpdated = moment(price.updated || 0);
      if (!price.buy || moment().isAfter(lastUpdated.add(1, 'h'))) {
        dispatch(addMessage('log', `Updating price for ${player.name}...`));
        await dispatch(findPrice(player.id));
      }
    }
  };
}


export function getTradepile(email) {
  return async dispatch => {
    dispatch(addMessage('log', 'Updating tradepile...'));
    const api = getApi(email);
    const response = await api.getTradepile();
    dispatch(setCredits(response.credits));
    dispatch({ type: types.SET_TRADEPILE, tradepile: response.auctionInfo });
  };
}

export function getWatchlist(email) {
  return async dispatch => {
    dispatch(addMessage('log', 'Updating watchlist...'));
    const api = getApi(email);
    const response = await api.getWatchlist();
    dispatch(setCredits(response.credits));
    dispatch(setWatchlist(response.auctionInfo));
  };
}

export function setWatchlist(watchlist) {
  return { type: types.SET_WATCHLIST, watchlist };
}

export function getUnassigned(email) {
  return async dispatch => {
    dispatch(addMessage('log', 'Updating unassigned...'));
    const api = getApi(email);
    const response = await api.getUnassigned();
    dispatch(setCredits(response.credits));
    dispatch({ type: types.SET_UNASSIGNED, unassigned: response.itemData });
  };
}

export function updateHistory(id, history) {
  return { type: types.UPDATE_PLAYER_HISTORY, id, history };
}

export function stop() {
  if (cycleTimeout) {
    window.clearTimeout(cycleTimeout);
    cycleTimeout = undefined;
  }
  return { type: types.STOP_BIDDING };
}

export function getMarketData(platform, type = 'live_graph', playerId = null) {
  return async dispatch => {
    /* istanbul ignore if */
    if (marketRequest) {
      marketRequest.abort();
      marketRequest = null;
    }
    return new Promise((resolve, reject) => {
      let url = 'https://www.futbin.com/pages/market/graph.php?';
      let qs = { type, console: platform.toUpperCase(), _: moment.utc().valueOf() };
      if (playerId) {
        url = 'https://www.futbin.com/pages/player/graph.php?';
        qs = { type, year: 17, player: playerId, _: moment.utc().valueOf() };
      }
      marketRequest = request.get(
        { url, qs },
        (error, response, body) => {
          if (error) {
            reject(error);
          }
          const json = JSON.parse(body);
          if (response.statusCode === 200) {
            resolve(json);
          }
        }
      );
    }).then(results => {
      const market = { title: results.title, flags: results.flags };
      switch (platform) {
        case 'xone':
        case 'x360':
          market.data = results.xbox;
          break;
        default:
          market.data = results.ps;
          break;
      }
      // Map flags
      const fillFlagColor = function fillFlagColor(design) {
        switch (parseInt(design, 10)) {
          case 1:
            return ['#000', '#000', '#dcb20a'];
          case 2:
            return ['#046aaf', '#046aaf', '#fff'];
          case 3:
            return ['#00591b', '#00591b', '#fff'];
          case 4:
            return ['#6099e6', '#6099e6', '#fff'];
          case 5:
            return ['#4f3581', '#4f3581', '#fff'];
          default:
            return ['#fff', '#000', '#fff'];
        }
      };
      market.flags = market.flags.map(flag => {
        const colorArray = fillFlagColor(flag.design);
        return {
          x: moment.utc(flag.flag_date).valueOf(),
          title: flag.title,
          text: flag.description,
          color: colorArray[0],
          fillColor: colorArray[1],
          style: {
            color: colorArray[2],
            borderRadius: 5
          }
        };
      });
      dispatch({ type: types.SAVE_MARKET_DATA, market });
    }).catch(() => { /* then we just won't update */ });
  };
}
