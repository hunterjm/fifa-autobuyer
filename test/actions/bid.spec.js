/* eslint-disable no-unused-expressions */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Fut from 'fut-promise';
import { expect } from 'chai';
import sinon from 'sinon';
import _ from 'lodash';
import request from 'request';
import * as actions from '../../app/actions/bid';
import * as accountActions from '../../app/actions/account';
import * as playerActions from '../../app/actions/player';
import * as types from '../../app/actions/bidTypes';
import * as logic from '../../app/actions/logic';
import * as ApiUtil from '../../app/utils/ApiUtil';
import player from '../mocks/player';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let sandbox;
let clock;
describe('actions', () => {
  describe('bid', () => {
    describe('creators', () => {
      it('should create SET_CYCLES action when setCycleCount() is called', () => {
        const count = 1;
        expect(actions.setCycleCount(count)).to.eql(
          { type: types.SET_CYCLES, count }
        );
      });

      it('should create SET_WATCH action when setWatched() is called', () => {
        const watched = { 111: 1 };
        expect(actions.setWatched(watched)).to.eql(
          { type: types.SET_WATCH, watched }
        );
      });

      it('should create UPDATE_WATCH action when updateWatched() is called', () => {
        const id = 112;
        const count = 1;
        expect(actions.updateWatched(id, count)).to.eql(
          { type: types.UPDATE_WATCH, id, count }
        );
      });

      it('should create SET_LISTED action when setListed() is called', () => {
        const listed = { 111: 1 };
        expect(actions.setListed(listed)).to.eql(
          { type: types.SET_LISTED, listed }
        );
      });

      it('should create UPDATE_LISTED action when updateListed() is called', () => {
        const id = 112;
        const count = 1;
        expect(actions.updateListed(id, count)).to.eql(
          { type: types.UPDATE_LISTED, id, count }
        );
      });

      it('should create SET_TRADES action when setTrades() is called', () => {
        const trades = { 111: { id: 111 } };
        expect(actions.setTrades(trades)).to.eql(
          { type: types.SET_TRADES, trades }
        );
      });

      it('should create UPDATE_TRADES action when updateTrades() is called', () => {
        const id = 112;
        const tradeResult = { id: 112 };
        expect(actions.updateTrades(id, tradeResult)).to.eql(
          { type: types.UPDATE_TRADES, id, tradeResult }
        );
      });

      it('should create SET_WATCHLIST action when setWatchlist() is called', () => {
        const watchlist = [1, 2, 3];
        expect(actions.setWatchlist(watchlist)).to.eql(
          { type: types.SET_WATCHLIST, watchlist }
        );
      });

      it('should create SET_BIN_STATUS action when setBINStatus() is called', () => {
        const won = true;
        expect(actions.setBINStatus(won)).to.eql(
          { type: types.SET_BIN_STATUS, won }
        );
      });

      it('should create UPDATE_PLAYER_HISTORY action when updateHistory() is called', () => {
        const history = {
          123456789: {
            id: 123456789,
            bought: 1411000,
            boughtAt: 123456789,
            sold: 1450000,
            soldAt: 142356789
          }
        };
        expect(actions.updateHistory(player.id, history)).to.eql(
          { type: types.UPDATE_PLAYER_HISTORY, id: player.id, history }
        );
      });

      it('should create STOP_BIDDING action when stop() is called', () => {
        expect(actions.stop()).to.eql(
          { type: types.STOP_BIDDING }
        );
      });
    });
    describe('async creators', () => {
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        clock = sinon.useFakeTimers(Date.now());
      });
      afterEach(() => {
        sandbox.restore();
        clock.restore();
      });

      it('should reset cycle count and call cycle() when start() is called', async () => {
        const logicStub = sandbox.stub(logic, 'default').returns(() => {});
        const store = mockStore({ settings: { autoStop: '0' } });
        await store.dispatch(actions.start());
        expect(logicStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.be.eql([
          { type: types.START_BIDDING },
          { type: types.SET_CYCLES, count: 0 },
          { type: types.CLEAR_MESSAGES }
        ]);
      });

      it('should automatically stop bidding after specified time when start() is called', async () => {
        const logicStub = sandbox.stub(logic, 'default').returns(() => {});
        const store = mockStore({ settings: { autoStop: '1' } });
        await store.dispatch(actions.start());
        expect(logicStub.calledOnce).to.eql(true);

        // Pass an hour by, which is what our autoStop is set to
        clock.tick(60 * 60 * 1000);

        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql([
          { type: types.START_BIDDING },
          { type: types.SET_CYCLES, count: 0 },
          { type: types.CLEAR_MESSAGES },
          { type: types.STOP_BIDDING }
        ]);
      });

      it('should handle empty search auctions for BIN price when snipe() is called', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [] });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.snipe(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should handle Error thrown in api.search() when snipe() is called', async () => {
        const searchStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.snipe(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should not buy card when snipe() is called if not enough credits', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          itemData: {
            contract: 1
          }
        }] });
        const bidStub = sandbox.stub().returns({ auctionInfo: [] });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const settings = { minCredits: 10000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.snipe(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        expect(bidStub.called).to.eql(false);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should not buy card when snipe() is called if not enough contracts', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          itemData: {
            contract: 0
          }
        }] });
        const bidStub = sandbox.stub().returns({ auctionInfo: [] });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.snipe(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        expect(bidStub.called).to.eql(false);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should buy card when snipe() is called if conditions met', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          itemData: {
            contract: 1
          }
        }] });
        const bidStub = sandbox.stub().returns({
          credits: 4999,
          auctionInfo: [{
            tradeId: 12345,
            tradeState: 'closed',
            bidState: 'buyNow',
            buyNowPrice: 1,
            itemData: {
              contract: 1
            }
          }]
        });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.snipe(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        expect(bidStub.calledOnce).to.eql(true);
        /*
        --- console.log(store.getActions) ---
        [ { type: 'account/set/credits', credits: 4999 },
          { type: 'bid/set/binStatus', won: true },
          { type: 'bid/update/listed', id: '20801', count: 1 } ]
         */
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.eql([
          accountActions.setCredits(4999),
          actions.setBINStatus(true),
          actions.updateListed(player.id, 1)
        ]);
      });

      it('should buy card when snipe() is called if conditions met and increment listed amount', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          itemData: {
            contract: 1
          }
        }] });
        const bidStub = sandbox.stub().returns({
          credits: 4999,
          auctionInfo: [{
            tradeId: 12345,
            tradeState: 'closed',
            bidState: 'buyNow',
            buyNowPrice: 1,
            itemData: {
              contract: 1
            }
          }]
        });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: { 20801: 1 }
          }
        };
        const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.snipe(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        expect(bidStub.calledOnce).to.eql(true);
        /*
        --- console.log(store.getActions) ---
        [ { type: 'account/set/credits', credits: 4999 },
          { type: 'bid/set/binStatus', won: true },
          { type: 'bid/update/listed', id: '20801', count: 1 } ]
         */
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.eql([
          accountActions.setCredits(4999),
          actions.setBINStatus(true),
          actions.updateListed(player.id, initialState.bid.listed[player.id] + 1)
        ]);
      });

      it('should handle Error in api.placeBid when snipe() is called', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          itemData: {
            contract: 1
          }
        }] });
        const bidStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.snipe(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        expect(bidStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should not place bid if snipeOnly setting is set when placeBid() is called', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          itemData: {
            contract: 1
          }
        }] });
        const bidStub = sandbox.stub().returns({
          credits: 4999,
          auctionInfo: [{
            tradeId: 12345,
            tradeState: 'closed',
            bidState: 'buyNow',
            buyNowPrice: 1,
            itemData: {
              contract: 1
            }
          }]
        });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const settings = { minCredits: 1000, maxCard: 5, snipeOnly: true };
        const store = mockStore(initialState);
        await store.dispatch(actions.placeBid(player, settings));
        expect(apiStub.called).to.eql(false);
        expect(searchStub.called).to.eql(false);
        expect(bidStub.called).to.eql(false);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should handle Error thrown in api.search() when placeBid() is called', async () => {
        const searchStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.placeBid(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should place bid when placeBid() is called with existing bid', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          expires: 250,
          currentBid: 1,
          itemData: {
            contract: 1
          }
        }] });
        const bidStub = sandbox.stub().returns({
          credits: 4999,
          auctionInfo: [{
            tradeId: 12345,
            tradeState: 'closed',
            bidState: 'highest',
            buyNowPrice: 1,
            itemData: {
              contract: 1
            }
          }]
        });

        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });

        const highestPriceStub = sandbox.stub(Fut, 'calculateNextHigherPrice').returns(3);

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 50000
          },
          bid: {
            bidding: true,
            listed: {},
            watched: {},
            trades: {}
          }
        };

        const settings = { minCredits: 10000, maxCard: 5, snipeOnly: false };
        const store = mockStore(initialState);
        await store.dispatch(actions.placeBid(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(highestPriceStub.calledTwice).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [
            accountActions.setCredits(4999),
            actions.updateTrades(12345, {
              tradeId: 12345,
              tradeState: 'closed',
              bidState: 'highest',
              buyNowPrice: 1,
              itemData: {
                contract: 1
              }
            }),
            actions.setWatchlist([]),
            actions.updateWatched(player.id, 1)
          ]
        );
      });

      it('should place bid when placeBid() is called with no current bid and a player already watched', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          expires: 250,
          currentBid: 0,
          startingBid: 1,
          itemData: {
            contract: 1
          }
        }] });
        const bidStub = sandbox.stub().returns({
          credits: 4999,
          auctionInfo: [{
            tradeId: 12345,
            tradeState: 'closed',
            bidState: 'highest',
            buyNowPrice: 1,
            itemData: {
              contract: 1
            }
          }]
        });

        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });

        const highestPriceStub = sandbox.stub(Fut, 'calculateNextHigherPrice').returns(3);

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 50000
          },
          bid: {
            bidding: true,
            listed: {},
            watched: { 20801: 2 },
            trades: {}
          }
        };

        const settings = { minCredits: 10000, maxCard: 5, snipeOnly: false };
        const store = mockStore(initialState);
        await store.dispatch(actions.placeBid(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(highestPriceStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [
            accountActions.setCredits(4999),
            actions.updateTrades(12345, {
              tradeId: 12345,
              tradeState: 'closed',
              bidState: 'highest',
              buyNowPrice: 1,
              itemData: {
                contract: 1
              }
            }),
            actions.setWatchlist([]),
            actions.updateWatched(player.id, 3)
          ]
        );
      });

      it('should handle Error in api.placeBid() when placeBid() is called', async () => {
        const searchStub = sandbox.stub().returns({ auctionInfo: [{
          tradeId: 12345,
          buyNowPrice: 1,
          expires: 250,
          currentBid: 1,
          itemData: {
            contract: 1
          }
        }] });
        const bidStub = sandbox.stub().throws();

        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub
        });

        const highestPriceStub = sandbox.stub(Fut, 'calculateNextHigherPrice').returns(3);

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 50000
          },
          bid: {
            bidding: true,
            listed: {},
            watched: {},
            trades: {}
          }
        };

        const settings = { minCredits: 10000, maxCard: 5, snipeOnly: false };
        const store = mockStore(initialState);
        await store.dispatch(actions.placeBid(player, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        expect(highestPriceStub.calledTwice).to.eql(true);
        expect(bidStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should not keep bidding when state.bid.bidding is false when keepBidding() is called', async () => {
        const logicStub = sandbox.stub(logic, 'default').returns(() => {});

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: false,
            listed: {}
          }
        };
        const store = mockStore(initialState);
        await store.dispatch(actions.keepBidding());
        expect(logicStub.calledOnce).to.eql(false);
      });

      it('should wait max 60 seconds if credits are < minCredits when keepBidding() is called', async () => {
        const logicStub = sandbox.stub(logic, 'default').returns(() => {});
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            watchlist: [],
            tradepile: [{ expires: 180 }]
          },
          settings: {
            minCredits: 10000
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.keepBidding());
        expect(logicStub.called).to.eql(false);
        clock.tick(60000);
        expect(logicStub.calledOnce).to.eql(true);
      });

      it('should wait min lowest expires time if credits are < minCredits when keepBidding() is called', async () => {
        const logicStub = sandbox.stub(logic, 'default').returns(() => {});
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            watchlist: [],
            tradepile: [{ expires: 5 }]
          },
          settings: {
            minCredits: 10000
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.keepBidding());
        expect(logicStub.called).to.eql(false);
        clock.tick(5000);
        expect(logicStub.calledOnce).to.eql(true);
      });

      it('should keep bidding and not wait when account credits are > minCredits when keepBidding() is called', async () => {
        const logicStub = sandbox.stub(logic, 'default').returns(() => {});
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          },
          settings: {
            minCredits: 1000
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.keepBidding());
        expect(logicStub.calledOnce).to.eql(true);
      });

      it('should not updatePrice if autoUpdate is false when updatePrice() is called', async () => {
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: false,
            listed: {}
          }
        };

        const findPriceStub = sandbox.stub(playerActions, 'findPrice').returns(() => {});

        const store = mockStore(initialState);
        const settings = { minCredits: 1000, maxCard: 5, autoUpdate: false };

        await store.dispatch(actions.updatePrice(player, settings));
        expect(findPriceStub.calledOnce).to.eql(false);
      });

      it('should updatePrice if autoUpdate is true when updatePrice() is called', async () => {
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: false,
            listed: {}
          }
        };

        const findPriceStub = sandbox.stub(playerActions, 'findPrice').returns(() => {});

        const store = mockStore(initialState);
        const settings = { minCredits: 1000, maxCard: 5, autoUpdate: true };

        const noPricePlayer = _.merge({}, player, { price: { buy: 0 } });
        await store.dispatch(actions.updatePrice(noPricePlayer, settings));
        expect(findPriceStub.called).to.eql(true);
      });

      it('should not updatePrice if autoUpdate is true when and price was updated within the hour when updatePrice() is called', async () => {
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: false,
            listed: {}
          }
        };

        const findPriceStub = sandbox.stub(playerActions, 'findPrice').returns(() => {});
        const store = mockStore(initialState);
        const settings = { minCredits: 1000, maxCard: 5, autoUpdate: true };

        const testPlayer = _.merge({}, player, { price: { updated: Date.now() } });
        await store.dispatch(actions.updatePrice(testPlayer, settings));
        expect(findPriceStub.calledOnce).to.eql(false);
      });

      it('should set off actions creators SET_CREDITS and SET_TRADEPILE when getTradepile() is called', async () => {
        const auctionInfo = [1, 3];
        const getTradepileStub = sandbox.stub().returns({ credits: 1, auctionInfo });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getTradepile: getTradepileStub
        });

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        // const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.getTradepile(initialState.account.email));
        expect(apiStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [accountActions.setCredits(1), { type: types.SET_TRADEPILE, tradepile: auctionInfo }]
        );
      });

      it('should set off action creators SET_CREDITS and SET_WATCHLIST when getWatchlist() is called', async () => {
        // not sure if this is correct but it seems to work and pass the test
        const auctionInfo = [1, 3];
        const getWatchlistStub = sandbox.stub().returns({ credits: 1, auctionInfo });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getWatchlist: getWatchlistStub
        });
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };
        const store = mockStore(initialState);
        await store.dispatch(actions.getWatchlist(initialState.account.email));
        expect(apiStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [accountActions.setCredits(1), actions.setWatchlist(auctionInfo)]
        );
      });

      it('should set off action creators SET_CREDITS and SET_UNASSIGNED when getUnassigned() is called', async () => {
        const itemData = [];
        const getUnassignedStub = sandbox.stub().returns({ credits: 1, itemData });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getUnassigned: getUnassignedStub
        });

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {}
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.getUnassigned(initialState.account.email));
        expect(apiStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [accountActions.setCredits(1), { type: types.SET_UNASSIGNED, unassigned: itemData }]
        );
      });

      it('should do nothing if state.bid.binWon is false when binNowToUnassigned() is called', async () => {
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: false
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.binNowToUnassigned());
        expect(store.getActions()).to.be.eql([]);
      });

      it('should getUnassigned and setBINStatus and stop if trackedPlayer is empty if state.bid.binWon is true when binNowToUnassigned() is called', async () => {
        const itemData = [{ id: player.Id, resourceId: 1 }];
        const getUnassignedStub = sandbox.stub().returns({ credits: 1, itemData });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getUnassigned: getUnassignedStub
        });
        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            unassigned: itemData
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.binNowToUnassigned());
        expect(apiStub.called).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [
            accountActions.setCredits(1),
            { type: types.SET_UNASSIGNED, unassigned: itemData },
            actions.setBINStatus(true)
          ]
        );
      });

      it('should send player to tradepile binNowToUnassigned() is called', async () => {
        const itemData = [{ id: player.Id, resourceId: 1 }];
        const getUnassignedStub = sandbox.stub().returns({ credits: 1, itemData });
        const sendToTradepileStub = sandbox.stub().returns({ itemData: [{ success: true }] });
        const listItemStub = sandbox.stub().returns({});
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getUnassigned: getUnassignedStub,
          sendToTradepile: sendToTradepileStub,
          listItem: listItemStub
        });
        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            unassigned: itemData,
            listed: {
              23: 1
            }
          },
          player: {
            list: {
              23: {
                price: {
                  sell: 100,
                  bin: 200
                }
              }
            }
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.binNowToUnassigned());
        expect(apiStub.calledTwice).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        expect(sendToTradepileStub.calledOnce).to.eql(true);
        expect(listItemStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [
            accountActions.setCredits(1),
            { type: types.SET_UNASSIGNED, unassigned: itemData },
            actions.setBINStatus(true),
            actions.updateListed(23, 2),
            actions.updateHistory(23, { id: undefined, bought: undefined, boughtAt: Date.now() })
          ]
        );
      });

      it('should throw error when sendToTradepile() is called when binNowToUnassigned() is called', async () => {
        const itemData = [{ id: player.id, resourceId: 1 }];
        const getUnassignedStub = sandbox.stub().returns({ credits: 1, itemData });
        const sendToTradepileStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getUnassigned: getUnassignedStub,
          sendToTradepile: sendToTradepileStub
        });
        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(player.id);
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            unassigned: itemData
          },
          player: {
            list: {}
          }
        };
        initialState.player.list[player.id] = player;

        const store = mockStore(initialState);
        await store.dispatch(actions.binNowToUnassigned());
        expect(apiStub.called).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        expect(sendToTradepileStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [
            accountActions.setCredits(1),
            { type: types.SET_UNASSIGNED, unassigned: itemData },
            actions.setBINStatus(true)
          ]
        );
      });

      it('should throw error when listItem() is called when binNowToUnassigned() is called', async () => {
        const itemData = [{ id: player.Id, resourceId: 1 }];
        const getUnassignedStub = sandbox.stub().returns({ credits: 1, itemData });
        const sendToTradepileStub = sandbox.stub().returns({ itemData: [{ success: true }] });
        const listItemStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getUnassigned: getUnassignedStub,
          sendToTradepile: sendToTradepileStub,
          listItem: listItemStub
        });
        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            unassigned: itemData,
            listed: {
              23: 1
            }
          },
          player: {
            list: {
              23: {
                price: {
                  sell: 100,
                  bin: 200
                }
              }
            }
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.binNowToUnassigned());
        expect(apiStub.calledTwice).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        expect(sendToTradepileStub.calledOnce).to.eql(true);
        expect(listItemStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.be.eql(
          [
            accountActions.setCredits(1),
            { type: types.SET_UNASSIGNED, unassigned: itemData },
            actions.setBINStatus(true),
          ]
        );
      });

      it('should do nothing if no expired trades are found when relistItems() is called', async () => {
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({});
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            tradepile: [{ tradeState: 'sold' }]
          }
        };

        const store = mockStore(initialState);
        const settings = { };

        await store.dispatch(actions.relistItems(settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.eql([]);
      });

      it('should relist items when settings.relistAll is true when relistItems() is called', async () => {
        const relistStub = sandbox.stub().returns({ code: 200 });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          relist: relistStub
        });

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            tradepile: [{ tradeState: 'expired' }]
          }
        };

        const store = mockStore(initialState);
        const settings = { relistAll: true };

        await store.dispatch(actions.relistItems(settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(relistStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should handle 500 code when relistItems() is called', async () => {
        const itemData = [{ tradeStae: 'expired', id: player.Id, resourceId: 1, startingBid: 350, buyNowPrice: 550 }];
        const listItemStub = sandbox.stub().throws();
        const relistStub = sandbox.stub().returns({ code: 500 });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          relist: relistStub,
          listItem: listItemStub
        });

        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            tradepile: [{ tradeState: 'expired', itemData }]
          },
          player: {
            list: {
              23: {
                price: {
                  sell: 600,
                  bin: 1000
                }
              }
            }
          }
        };

        const store = mockStore(initialState);
        const settings = { relistAll: true };

        await store.dispatch(actions.relistItems(settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(relistStub.calledOnce).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        expect(listItemStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should handle error in api.listItem() when relistItems() is called', async () => {
        const itemData = [{ tradeStae: 'expired', id: player.Id, resourceId: 1, startingBid: 350, buyNowPrice: 550 }];
        const listItemStub = sandbox.stub().throws();
        const relistStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          relist: relistStub,
          listItem: listItemStub
        });

        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            tradepile: [{ tradeState: 'expired', itemData }]
          },
          player: {
            list: {
              23: {
                price: {
                  sell: 600,
                  bin: 1000
                }
              }
            }
          }
        };

        const store = mockStore(initialState);
        const settings = { relistAll: true };

        await store.dispatch(actions.relistItems(settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(relistStub.calledOnce).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        expect(listItemStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should manually relist items when error occurs on relistAll when relistItems() is called', async () => {
        const itemData = [{ tradeStae: 'expired', id: player.Id, resourceId: 1, startingBid: 350, buyNowPrice: 550 }];
        const listItemStub = sandbox.stub().returns({});
        const relistStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          relist: relistStub,
          listItem: listItemStub
        });

        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            tradepile: [{ tradeState: 'expired', itemData }]
          },
          player: {
            list: {
              23: {
                price: {
                  sell: 600,
                  bin: 1000
                }
              }
            }
          }
        };

        const store = mockStore(initialState);
        const settings = { relistAll: true };

        await store.dispatch(actions.relistItems(settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(relistStub.calledOnce).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        expect(listItemStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should do nothing when nothing has been sold when logSold() is called', async () => {
        const itemData = [{ id: player.Id, resourceId: 1, startingBid: 350, buyNowPrice: 550 }];
        // const listItemStub = sandbox.stub().throws();
        // const relistStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({});

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            tradepile: [{ tradeState: 'expired', itemData }]
          },
          player: {
            list: {
              23: {
                price: {
                  sell: 600,
                  bin: 1000
                }
              }
            }
          }
        };
        const store = mockStore(initialState);
        await store.dispatch(actions.logSold());
        expect(apiStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.eql([]);
      });

      it('should successfully execute logSold()', async () => {
        const itemData = {
          id: player.id,
          resourceId: 1,
          startingBid: 350,
          buyNowPrice: 550,
          currentBid: 400,
          sold: 400
        };

        const getTradepileStub = sandbox.stub().returns(
           { credits: 4000, auctionInfo: itemData }
        );
        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const removeFromTradepileStub = sandbox.stub().returns({});
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          removeFromTradepile: removeFromTradepileStub,
          getTradepile: getTradepileStub
        });

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            tradepile: [{ tradeState: 'closed', itemData, currentBid: 400 }]
          },
          player: {
            list: {
              23: {
                price: {
                  sell: 600,
                  bin: 1000
                }
              }
            }
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.logSold());
        expect(apiStub.calledTwice).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        expect(removeFromTradepileStub.calledOnce).to.eql(true);
        expect(getTradepileStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.eql(
          [
            actions.updateHistory(23, {
              id: itemData.id,
              sold: 400,
              soldAt: Date.now()
            }),
            accountActions.setCredits(4000),
            { type: types.SET_TRADEPILE, tradepile: itemData }
          ]
        );
      });

      it('should throw when removeFromTradepile is called when logSold() is called', async () => {
        const itemData = {
          id: player.id,
          resourceId: 1,
          startingBid: 350,
          buyNowPrice: 550,
          currentBid: 400,
          sold: 400
        };

        const getTradepileStub = sandbox.stub().returns(
           { credits: 4000, auctionInfo: itemData }
        );
        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const removeFromTradepileStub = sandbox.stub().throws();
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          removeFromTradepile: removeFromTradepileStub,
          getTradepile: getTradepileStub
        });

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            binWon: true,
            tradepile: [{ tradeState: 'closed', itemData, currentBid: 400 }]
          },
          player: {
            list: {
              23: {
                price: {
                  sell: 600,
                  bin: 1000
                }
              }
            }
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.logSold());
        expect(apiStub.calledTwice).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        expect(removeFromTradepileStub.calledOnce).to.eql(true);
        expect(getTradepileStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.eql(
          [
            actions.updateHistory(23, {
              id: itemData.id,
              sold: 400,
              soldAt: Date.now()
            }),
            accountActions.setCredits(4000),
            { type: types.SET_TRADEPILE, tradepile: itemData }
          ]
        );
      });

      it('should only call getApi() and exit when snipeOnly is set when continueTracking() is called', async () => {
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({});

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            trades: {}
          }
        };
        const settings = { snipeOnly: true };
        const store = mockStore(initialState);
        await store.dispatch(actions.continueTracking(settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(store.getActions().length).to.eql(0);
      });

      it('should handle error in getStatus when continueTracking() is called', async () => {
        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const getStatusStub = sandbox.stub().throws();

        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getStatus: getStatusStub
        });

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            trades: {
              1: {}
            },
            listed: {}
          },
          player: {
            list: {
              23: {
                history: {},
                price: {
                  sell: 600,
                  bin: 1000
                }
              }
            }
          }
        };

        const settings = { snipeOnly: false };
        const store = mockStore(initialState);
        await store.dispatch(actions.continueTracking(settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(getStatusStub.calledOnce).to.eql(true);
        expect(getBaseIdStub.called).to.eql(false);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions.length).to.eql(0);
      });

      it('should continue to track item when continueTracking() is called', async () => {
        const auctionInfo = [{
          tradeId: 1,
          expires: -1,
          itemData: {
            id: 1,
            resourceId: 444,
          },
          startingBid: 350,
          buyNowPrice: 550,
          currentBid: 400,
          bidState: 'highest'
        }, {
          tradeId: 2,
          expires: -1,
          itemData: {
            id: 2,
            resourceId: 444,
          },
          startingBid: 350,
          buyNowPrice: 550,
          currentBid: 400,
          bidState: 'outbid'
        }, {
          tradeId: 3,
          expires: 100,
          itemData: {
            id: 3,
            resourceId: 444,
          },
          startingBid: 350,
          buyNowPrice: 550,
          currentBid: 10000,
          bidState: 'outbid'
        }, {
          tradeId: 4,
          expires: 100,
          itemData: {
            id: 4,
            resourceId: 444,
          },
          startingBid: 350,
          buyNowPrice: 550,
          currentBid: 400,
          bidState: 'outbid'
        }];

        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const getStatusStub = sandbox.stub().returns({ credits: 4000, auctionInfo });
        const sendToTradepileStub = sandbox.stub().returns({ itemData: [{ success: true }] });
        const listItemStub = sandbox.stub().returns({});
        const removeFromWatchlistStub = sandbox.stub().returns({});
        const placeBidStub = sandbox.stub()
          .returns({ credits: 3500, auctionInfo: [auctionInfo[2]] });
        const getTradepileStub = sandbox.stub()
          .returns({ credits: 3000, auctionInfo: [auctionInfo[0]] });

        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getStatus: getStatusStub,
          sendToTradepile: sendToTradepileStub,
          listItem: listItemStub,
          removeFromWatchlist: removeFromWatchlistStub,
          placeBid: placeBidStub,
          getTradepile: getTradepileStub
        });

        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            tradepile: [],
            watchlist: auctionInfo,
            trades: {
              1: auctionInfo[0],
              2: auctionInfo[1],
              3: auctionInfo[2],
              4: auctionInfo[3]
            },
            listed: {},
            watched: { 23: 4 }
          },
          player: {
            list: {
              23: {
                history: {},
                price: {
                  buy: 600,
                  sell: 700,
                  bin: 1000
                }
              }
            }
          }
        };

        const settings = { snipeOnly: false, minCredits: 1000, maxPlayer: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.continueTracking(settings));
        // Called once for tracking, once for tradepile
        expect(apiStub.calledTwice).to.eql(true);
        expect(getStatusStub.calledOnce).to.eql(true);
        expect(getBaseIdStub.callCount).to.eql(4);
        expect(sendToTradepileStub.calledOnce).to.eql(true);
        expect(listItemStub.calledOnce).to.eql(true);
        expect(removeFromWatchlistStub.calledTwice).to.eql(true);
        expect(getTradepileStub.calledOnce).to.eql(true);
        expect(placeBidStub.calledOnce).to.eql(true);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.eql([
          accountActions.setCredits(4000),
          // Update listed count for won
          actions.updateListed(23, 1),
          // Update purchase history
          actions.updateHistory(23, { bought: 400, boughtAt: Date.now(), id: 1 }),
          // remove expired lost
          actions.setWatchlist([auctionInfo[0], auctionInfo[2], auctionInfo[3]]),
          // remove outbid won't pay
          actions.setWatchlist([auctionInfo[0], auctionInfo[3]]),
          // Update credits after bidding war starts
          accountActions.setCredits(3500),
          // Update credits with tradepile response
          accountActions.setCredits(3000),
          // Refresh tradepile since we sent something there
          { type: types.SET_TRADEPILE, tradepile: [auctionInfo[0]] },
        ]);
      });

      it('should handle clearing existing timers when stop() is called', async () => {
        const logicStub = sandbox.stub(logic, 'default').returns(() => {});
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            watchlist: [],
            tradepile: [{ expires: 180 }]
          },
          settings: {
            minCredits: 10000,
            autoStop: '1'
          }
        };

        const store = mockStore(initialState);
        await store.dispatch(actions.keepBidding());
        await store.dispatch(actions.stop());
        clock.tick(60000);
        expect(logicStub.called).to.eql(false);
        const cleanActions = _.filter(store.getActions(), a => a.type !== types.ADD_MESSAGE);
        expect(cleanActions).to.eql([
          { type: types.STOP_BIDDING }
        ]);
      });

      it('should handle request error when getMarketData() is called', async () => {
        const requestStub = sandbox.stub(request, 'get').yields(new Error('fail'), { statusCode: 500 }, null);

        const store = mockStore({});
        await store.dispatch(actions.getMarketData('xone'));
        expect(requestStub.calledOnce).to.eql(true);
        expect(store.getActions().length).to.eql(0);
      });

      it('should dispatch SAVE_MARKET_DATA with live_graph data when getMarketData() is called', async () => {
        const requestStub = sandbox.stub(request, 'get').yields(
          null,
          { statusCode: 200 },
          '{"xbox":[[1483928220000,51.86],[1483928280000,51.84],[1483928340000,51.81]],"ps":[],"flags":[],"title":"Index100 Fluctuation"}'
        );

        const store = mockStore({});
        await store.dispatch(actions.getMarketData('xone'));
        expect(requestStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.eql([
          {
            type: types.SAVE_MARKET_DATA,
            market: {
              data: [[1483928220000, 51.86], [1483928280000, 51.84], [1483928340000, 51.81]],
              flags: [],
              title: 'Index100 Fluctuation'
            }
          }
        ]);
      });

      it('should dispatch SAVE_MARKET_DATA with daily_graph data when getMarketData() is called', async () => {
        const requestStub = sandbox.stub(request, 'get').yields(
          null,
          { statusCode: 200 },
          '{"xbox":[[1483747200000,1383],[1483833600000,1433],[1483920000000,1333]],"ps":[[1483747200000,1400],[1483833600000,1329],[1483920000000,1288]],"flags":[{"design":1,"title":"test1","description":"test1","flag_date":"2017-01-09 09:31:00"},{"design":2,"title":"test2","description":"test2","flag_date":"2017-01-09 09:31:00"},{"design":3,"title":"test3","description":"test3","flag_date":"2017-01-09 09:31:00"}],"title":"Daily Price Fluctuation"}'
        );

        const store = mockStore({});
        await store.dispatch(actions.getMarketData('xone', 'daily_graph', player.id));
        expect(requestStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.eql([
          {
            type: types.SAVE_MARKET_DATA,
            market: {
              data: [[1483747200000, 1383], [1483833600000, 1433], [1483920000000, 1333]],
              flags: [
                {
                  color: '#000',
                  fillColor: '#000',
                  style: {
                    borderRadius: 5,
                    color: '#dcb20a'
                  },
                  text: 'test1',
                  title: 'test1',
                  x: 1483954260000
                },
                {
                  color: '#046aaf',
                  fillColor: '#046aaf',
                  style: {
                    borderRadius: 5,
                    color: '#fff'
                  },
                  text: 'test2',
                  title: 'test2',
                  x: 1483954260000
                },
                {
                  color: '#00591b',
                  fillColor: '#00591b',
                  style: {
                    borderRadius: 5,
                    color: '#fff'
                  },
                  text: 'test3',
                  title: 'test3',
                  x: 1483954260000
                }
              ],
              title: 'Daily Price Fluctuation'
            }
          }
        ]);
      });

      it('should dispatch SAVE_MARKET_DATA with ps daily_graph data when getMarketData() is with ps4', async () => {
        const requestStub = sandbox.stub(request, 'get').yields(
          null,
          { statusCode: 200 },
          '{"xbox":[[1483747200000,1383],[1483833600000,1433],[1483920000000,1333]],"ps":[[1483747200000,1400],[1483833600000,1329],[1483920000000,1288]],"flags":[{"design":4,"title":"test4","description":"test4","flag_date":"2017-01-09 09:31:00"},{"design":"5","title":"test5","description":"test5","flag_date":"2017-01-09 09:31:00"},{"design":"6","title":"test6","description":"test6","flag_date":"2017-01-09 09:31:00"}],"title":"Daily Price Fluctuation"}'
        );

        const store = mockStore({});
        await store.dispatch(actions.getMarketData('ps4', 'daily_graph', player.id));
        expect(requestStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.eql([
          {
            type: types.SAVE_MARKET_DATA,
            market: {
              data: [[1483747200000, 1400], [1483833600000, 1329], [1483920000000, 1288]],
              flags: [
                {
                  color: '#6099e6',
                  fillColor: '#6099e6',
                  style: {
                    borderRadius: 5,
                    color: '#fff'
                  },
                  text: 'test4',
                  title: 'test4',
                  x: 1483954260000
                },
                {
                  color: '#4f3581',
                  fillColor: '#4f3581',
                  style: {
                    borderRadius: 5,
                    color: '#fff'
                  },
                  text: 'test5',
                  title: 'test5',
                  x: 1483954260000
                },
                {
                  color: '#fff',
                  fillColor: '#000',
                  style: {
                    borderRadius: 5,
                    color: '#fff'
                  },
                  text: 'test6',
                  title: 'test6',
                  x: 1483954260000
                }
              ],
              title: 'Daily Price Fluctuation'
            }
          }
        ]);
      });
    });
  });
});
