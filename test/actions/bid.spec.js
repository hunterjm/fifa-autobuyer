/* eslint-disable no-unused-expressions */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Fut from 'fut-promise';
import moment from 'moment';
import { expect } from 'chai';
import sinon from 'sinon';
import _ from 'lodash';

import * as actions from '../../app/actions/bid';
import * as accountActions from '../../app/actions/account';
import * as playerActions from '../../app/actions/player';
import * as types from '../../app/actions/bidTypes';
import * as logic from '../../app/actions/logic';
import * as ApiUtil from '../../app/utils/ApiUtil';
import player, { bidPlayer } from '../mocks/player';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let sandbox;
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
      });
      afterEach(() => {
        sandbox.restore();
      });

      it('should reset cycle count and call cycle() when start() is called', async () => {
        const logicStub = sandbox.stub(logic, 'default').returns(() => {});
        const store = mockStore({});
        await store.dispatch(actions.start());
        expect(logicStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.be.eql([
          { type: types.START_BIDDING },
          { type: types.SET_CYCLES, count: 0 }
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
        expect(store.getActions().length).to.eql(0);
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
        expect(store.getActions().length).to.eql(0);
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
        expect(store.getActions().length).to.eql(0);
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
        expect(store.getActions().length).to.eql(0);
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
        expect(store.getActions()).to.eql([
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
        expect(store.getActions()).to.eql([
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
        expect(store.getActions().length).to.eql(0);
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
        expect(store.getActions().length).to.eql(0);
      });

      it('should place bid when placeBid() is called', async () => {
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
        await store.dispatch(actions.placeBid(bidPlayer, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(highestPriceStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.be.eql(
          [
            accountActions.setCredits(4999),
            actions.updateListed(12345, {
              tradeId: 12345,
              tradeState: 'closed',
              bidState: 'highest',
              buyNowPrice: 1,
              itemData: {
                contract: 1
              }
            }),
            actions.setWatchlist([]),
            actions.updateWatched(bidPlayer.id, 1)
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
        await store.dispatch(actions.placeBid(bidPlayer, settings));
        expect(apiStub.calledOnce).to.eql(true);
        expect(searchStub.calledOnce).to.eql(true);
        expect(highestPriceStub.calledOnce).to.eql(true);
        expect(bidStub.calledOnce).to.eql(true);
        expect(store.getActions().length).to.eql(0);
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

      it('should  updatePrice if autoUpdate is true when updatePrice() is called', async () => {
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

        await store.dispatch(actions.updatePrice(player, settings));
        expect(findPriceStub.calledOnce).to.eql(true);
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
        bidPlayer.price.updated = moment().toISOString(); // set update to now
        const store = mockStore(initialState);
        const settings = { minCredits: 1000, maxCard: 5, autoUpdate: true };

        await store.dispatch(actions.updatePrice(bidPlayer, settings));
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
        expect(store.getActions()).to.be.eql(
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
        // const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.getWatchlist(initialState.account.email));
        expect(apiStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.be.eql(
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
        // const settings = { minCredits: 1000, maxCard: 5 };
        const store = mockStore(initialState);
        await store.dispatch(actions.getUnassigned(initialState.account.email));
        expect(apiStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.be.eql(
          [accountActions.setCredits(1), { type: types.SET_UNASSIGNED, unassigned: itemData }]
        );
      });

      it('should do something here when updateItems() is called', async () => {
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
        const auctionInfo = [{ itemData: { tradeId: 12345, resourceId: 111, tradeState: 'expired' } }];
        const getWatchlistStub = sandbox.stub().returns({ credits: 1, auctionInfo });
        const getStatusStub = sandbox.stub().returns({ credits: 4999, auctionInfo });
        const relistStub = sandbox.stub().returns({ code: 200 });
        const apiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          search: searchStub,
          placeBid: bidStub,
          getWatchlist: getWatchlistStub,
          getStatus: getStatusStub,
          relist: relistStub
        });

        const getBaseIdStub = sandbox.stub(Fut, 'getBaseId').returns(23);
        const initialState = {
          account: {
            email: 'test@test.com',
            credits: 5000
          },
          bid: {
            bidding: true,
            listed: {},
            watchlist: auctionInfo,
            trades: _.keyBy(auctionInfo, 'tradeId'),
            tradepile: [
              {
                tradeState: 'expired',
                itemData: {
                  itemState: 'notFree'
                }
              }
            ]
          },
          player: bidPlayer
        };
        const settings = { minCredits: 1000, maxCard: 5, relistAll: true };
        const store = mockStore(initialState);
        await store.dispatch(actions.updateItems(bidPlayer, settings));
        expect(apiStub.called).to.eql(true);
        expect(getWatchlistStub.calledOnce).to.eql(true);
        expect(getBaseIdStub.calledOnce).to.eql(true);
        // expect(store.getActions()).to.be.eql(
        //   [accountActions.setCredits(1), { type: types.SET_UNASSIGNED, unassigned: itemData }]
        // );
      });
    });
  });
});