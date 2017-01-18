import _ from 'lodash';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import Fut from 'fut-promise';
import cycle from '../../../app/actions/logic';
import * as bidActions from '../../../app/actions/bid';
import player, { totwPlayer } from '../../mocks/player';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const initialState = {
  account: {
    email: 'test@test.com',
    password: 'test',
    secret: 'test',
    platform: 'xone',
    credits: 5000,
    pilesize: {
      tradepile: 30,
      watchlist: 30
    }
  },
  player: {
    search: {},
    list: {}
  },
  settings: {
    rpm: '15',
    minCredits: '1000',
    maxCard: '10',
    snipeOnly: false,
    autoUpdate: true,
    buy: '90',
    sell: '100',
    bin: '110',
    relistAll: false
  },
  bid: {
    bidding: false,
    cycles: 0,
    tradepile: [],
    watchlist: [],
    watched: {},
    listed: {},
    trades: {},
    unassigned: [],
    market: {
      data: [],
      flags: []
    }
  }
};
initialState.player.list[player.id] = player;
initialState.player.list[totwPlayer.id] = totwPlayer;

function setup(sandbox) {
  // Stub Fut.getBaseId so we don't have to mess with it
  sandbox.stub(Fut, 'getBaseId').withArgs(player.id).returns(player.id);
  // Stub bid actions
  return {
    getUnassigned: sandbox.stub(bidActions, 'getUnassigned').returns(() => {}),
    getWatchlist: sandbox.stub(bidActions, 'getWatchlist').returns(() => {}),
    getTradepile: sandbox.stub(bidActions, 'getTradepile').returns(() => {}),
    setCycleCount: sandbox.spy(bidActions, 'setCycleCount'),
    setTrades: sandbox.spy(bidActions, 'setTrades'),
    setListed: sandbox.spy(bidActions, 'setListed'),
    setWatched: sandbox.spy(bidActions, 'setWatched'),
    updatePrice: sandbox.stub(bidActions, 'updatePrice').returns(() => {}),
    setBINStatus: sandbox.spy(bidActions, 'setBINStatus'),
    snipe: sandbox.stub(bidActions, 'snipe').returns(() => {}),
    placeBid: sandbox.stub(bidActions, 'placeBid').returns(() => {}),
    continueTracking: sandbox.stub(bidActions, 'continueTracking').returns(() => {}),
    binNowToUnassigned: sandbox.stub(bidActions, 'binNowToUnassigned').returns(() => {}),
    relistItems: sandbox.stub(bidActions, 'relistItems').returns(() => {}),
    logSold: sandbox.stub(bidActions, 'logSold').returns(() => {}),
    keepBidding: sandbox.stub(bidActions, 'keepBidding').returns(() => {})
  };
}

let sandbox;
describe('actions', () => {
  describe('logic', () => {
    describe('async creators', () => {
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
      });
      afterEach(() => {
        sandbox.restore();
      });

      it('should not call getUnassigned on repeat cycles', async () => {
        const {
          getUnassigned,
          getTradepile,
          snipe,
          placeBid,
          continueTracking,
          keepBidding
        } = setup(sandbox);
        const state = _.merge({}, initialState, {
          bid: {
            bidding: true,
            cycles: 1
          }
        });
        const store = mockStore(state);
        await store.dispatch(cycle());
        expect(getUnassigned.called).to.eql(false);
        expect(getTradepile.calledOnce).to.eql(true);
        expect(snipe.calledTwice).to.eql(true);
        expect(placeBid.calledTwice).to.eql(true);
        expect(continueTracking.calledTwice).to.eql(true);
        expect(keepBidding.calledOnce).to.eql(true);
      });

      it('should not call bid or update actions with empty player list', async () => {
        const {
          getUnassigned,
          getWatchlist,
          getTradepile,
          setCycleCount,
          setTrades,
          setListed,
          setWatched,
          updatePrice,
          setBINStatus,
          snipe,
          placeBid,
          continueTracking,
          keepBidding
        } = setup(sandbox);
        const state = _.merge({}, initialState, {
          bid: {
            bidding: true,
            cycles: 1
          }
        });
        state.player.list = {};
        const store = mockStore(state);
        await store.dispatch(cycle());
        expect(getUnassigned.called).to.eql(false);
        expect(getWatchlist.called).to.eql(false);
        expect(getTradepile.calledOnce).to.eql(true);
        expect(setCycleCount.calledOnce).to.eql(true);
        expect(setTrades.calledOnce).to.eql(true);
        expect(setListed.called).to.eql(false);
        expect(setWatched.called).to.eql(false);
        expect(updatePrice.called).to.eql(false);
        expect(setBINStatus.called).to.eql(false);
        expect(snipe.called).to.eql(false);
        expect(placeBid.called).to.eql(false);
        expect(continueTracking.called).to.eql(false);
        expect(keepBidding.calledOnce).to.eql(true);
      });

      it('should not search if not bidding', async () => {
        const {
          getUnassigned,
          getWatchlist,
          getTradepile,
          snipe,
          placeBid,
          continueTracking,
          keepBidding
        } = setup(sandbox);
        const store = mockStore(initialState);
        await store.dispatch(cycle());
        expect(getUnassigned.calledOnce).to.eql(true);
        expect(getWatchlist.calledOnce).to.eql(true);
        expect(getTradepile.calledOnce).to.eql(true);
        expect(snipe.called).to.eql(false);
        expect(placeBid.called).to.eql(false);
        expect(continueTracking.called).to.eql(false);
        expect(keepBidding.calledOnce).to.eql(true);
      });

      it('should not search if tradepile is full', async () => {
        const {
          getUnassigned,
          getWatchlist,
          getTradepile,
          snipe,
          placeBid,
          continueTracking,
          keepBidding
        } = setup(sandbox);
        const state = _.merge({}, initialState, {
          bid: {
            bidding: true,
            tradepile: new Array(30).fill({
              itemData: {
                resourceId: player.id
              }
            })
          }
        });
        const store = mockStore(state);
        await store.dispatch(cycle());
        expect(getUnassigned.calledOnce).to.eql(true);
        expect(getWatchlist.callCount).to.eql(3); // Once at start, twice at update
        expect(getTradepile.calledOnce).to.eql(true);
        expect(snipe.called).to.eql(false);
        expect(placeBid.called).to.eql(false);
        expect(continueTracking.calledTwice).to.eql(true);
        expect(keepBidding.calledOnce).to.eql(true);
      });

      it('should not search if not enough credits', async () => {
        const {
          getUnassigned,
          getWatchlist,
          getTradepile,
          snipe,
          placeBid,
          continueTracking,
          keepBidding
        } = setup(sandbox);
        const state = _.merge({}, initialState, {
          account: { credits: 0 },
          bid: { bidding: true }
        });
        const store = mockStore(state);
        await store.dispatch(cycle());
        expect(getUnassigned.calledOnce).to.eql(true);
        expect(getWatchlist.callCount).to.eql(3); // Once at start, twice at update
        expect(getTradepile.calledOnce).to.eql(true);
        expect(snipe.called).to.eql(false);
        expect(placeBid.called).to.eql(false);
        expect(continueTracking.calledTwice).to.eql(true);
        expect(keepBidding.calledOnce).to.eql(true);
      });

      it('should not search if too many of a player are listed already', async () => {
        const {
          getUnassigned,
          getWatchlist,
          getTradepile,
          snipe,
          placeBid,
          continueTracking,
          keepBidding
        } = setup(sandbox);
        const state = _.merge({}, initialState, {
          bid: {
            bidding: true,
            tradepile: new Array(10).fill({
              itemData: {
                resourceId: player.id
              }
            }),
            watchlist: new Array(2).fill({
              itemData: {
                resourceId: totwPlayer.id
              }
            })
          }
        });
        state.bid.listed[player.id] = state.bid.tradepile.length;
        state.bid.watched[totwPlayer.id] = state.bid.watchlist.length;
        const store = mockStore(state);
        await store.dispatch(cycle());
        expect(getUnassigned.calledOnce).to.eql(true);
        expect(getWatchlist.callCount).to.eql(3); // Once at start, twice at update
        expect(getTradepile.calledOnce).to.eql(true);
        // These are called once for TOTW player (the other card in the list)
        expect(snipe.calledOnce).to.eql(true);
        expect(placeBid.calledOnce).to.eql(true);
        expect(continueTracking.calledTwice).to.eql(true);
        expect(keepBidding.calledOnce).to.eql(true);
      });
    });
  });
});
