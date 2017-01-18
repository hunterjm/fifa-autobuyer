import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import Fut from 'fut-promise';
import { Transfers } from '../../../app/components/bid/Transfers';
import player, { totwPlayer } from '../../mocks/player';

function setup(state) {
  const actions = {
    getWatchlist: sinon.spy(),
    getTradepile: sinon.spy(),
    getUnassigned: sinon.spy()
  };
  const initialState = _.merge({}, {
    account: {
      platform: 'xone',
      pilesize: {
        tradepile: 30,
        watchlist: 30
      }
    },
    player: {
      list: {},
      search: {}
    },
    bid: {
      bidding: false,
      watchlist: [{
        bidState: 'highest',
        currentBid: 1000,
        startingBid: 600,
        buyNowPrice: 2000,
        expires: 60,
        itemData: {
          id: 1,
          resourceId: player.id
        }
      }, {
        bidState: 'outbid',
        currentBid: 1000,
        startingBid: 600,
        buyNowPrice: 2000,
        expires: 60,
        itemData: {
          id: 2,
          resourceId: player.id
        }
      }, {
        bidState: 'outbid',
        currentBid: 1000,
        startingBid: 600,
        buyNowPrice: 2000,
        expires: -1,
        itemData: {
          id: 3,
          resourceId: player.id
        }
      }, {
        bidState: 'outbid',
        currentBid: 100000000,
        startingBid: 600,
        buyNowPrice: 2000,
        expires: 60,
        itemData: {
          id: 4,
          resourceId: player.id
        }
      }],
      tradepile: [{
        currentBid: 1000,
        startingBid: 600,
        buyNowPrice: 2000,
        expires: -1,
        itemData: {
          id: 5,
          resourceId: player.id,
          itemState: 'invalid'
        }
      }, {
        currentBid: 1000,
        startingBid: 600,
        buyNowPrice: 2000,
        expires: -1,
        itemData: {
          id: 6,
          resourceId: player.id,
          itemState: 'free'
        }
      }],
      unassigned: [{
        id: 7,
        bidState: 'highest',
        currentBid: 1000,
        startingBid: 600,
        buyNowPrice: 2000,
        expires: 60,
        resourceId: player.id
      }],
      market: {
        data: [[1483760374000, 1000], [1483760434000, 1100]],
        flags: []
      },
    }
  }, state);
  initialState.player.list[player.id] = player;
  initialState.player.list[totwPlayer.id] = totwPlayer;
  const props = {
    bidding: initialState.bid.bidding,
    email: initialState.account.email,
    pilesize: initialState.account.pilesize
  };
  const component = mount(<Transfers {...actions} {...props} {...initialState} />);
  return {
    component,
    actions
  };
}
let sandbox;
let clock;
describe('components', () => {
  describe('bid', () => {
    describe('Transfers', () => {
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        clock = sinon.useFakeTimers();
      });
      afterEach(() => {
        sandbox.restore();
        clock.restore();
      });

      it('should load trade data on mount if not bidding', () => {
        sandbox.stub(Fut, 'getBaseId').returns(player.id);
        const { actions } = setup();
        clock.tick(1000);
        expect(actions.getWatchlist.calledOnce).to.be.true;
        expect(actions.getTradepile.calledOnce).to.be.true;
        expect(actions.getUnassigned.calledOnce).to.be.true;
      });

      it('should display items with correct classes', () => {
        sandbox.stub(Fut, 'getBaseId').returns(player.id);
        const { component } = setup();
        const expires = component.find('tbody').children();
        expect(expires).to.have.length(7);
        expect(expires.at(0).prop('className')).to.eql('success');
        expect(expires.at(1).prop('className')).to.eql('warning');
        expect(expires.at(2).prop('className')).to.eql('danger');
        expect(expires.at(3).prop('className')).to.eql('danger');
        expect(expires.at(4).prop('className')).to.eql('success');
        expect(expires.at(5).prop('className')).to.eql('danger');
        component.unmount();
      });
    });
  });
});
