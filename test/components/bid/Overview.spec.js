import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Highcharts from 'highcharts/highstock';
import * as ApiUtil from '../../../app/utils/ApiUtil';
import { shell } from '../../mocks/electron';
import { Overview } from '../../../app/components/bid/Overview';
import player, { totwPlayer } from '../../mocks/player';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

function setup(state, history = false) {
  const actions = {
    getMarketData: sinon.stub().returns(),
    start: sinon.spy(),
    stop: sinon.spy()
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
    history: {},
    bid: {
      bidding: false,
      watchlist: [],
      tradepile: [],
      unassigned: [],
      market: {
        data: [[1483760374000, 1000], [1483760434000, 1100]],
        flags: []
      },
    }
  }, state);
  initialState.player.list[player.id] = player;
  initialState.player.list[totwPlayer.id] = totwPlayer;
  initialState.history[player.id] = {
    123456789: {
      id: 123456789,
      bought: 1411000,
      boughtAt: 123456789,
      sold: 1450000,
      soldAt: 142356789
    }
  };
  initialState.history[totwPlayer.id] = {
    123456789: {
      id: 123456789,
      bought: 239000,
      boughtAt: 123456789,
      sold: 269000,
      soldAt: 142356789
    }
  };
  const store = mockStore(initialState);
  const context = {
    context: {
      store,
      router: {
        push: sinon.spy(),
        replace: sinon.spy(),
        go: sinon.spy(),
        goBack: sinon.spy(),
        goForward: sinon.spy(),
        createHref: sinon.spy(),
        setRouteLeaveHook: sinon.spy(),
        isActive: sinon.stub().returns(history)
      }
    },
    childContextTypes: {
      store: React.PropTypes.object,
      router: React.PropTypes.object
    }
  };
  const component = mount(
    <Overview
      {...actions}
      bidding={initialState.bid.bidding}
      platform={initialState.account.platform}
      {...initialState}
    />, context);
  return {
    component,
    actions,
    store,
    buttons: component.find('.widget .action')
  };
}
let sandbox;
describe('components', () => {
  describe('bid', () => {
    describe('Overview', () => {
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(ApiUtil, 'getApi').returns({
          getWatchlist: sandbox.stub().returns({ credits: 1000, auctionInfo: [] }),
          getTradepile: sandbox.stub().returns({ credits: 1000, auctionInfo: [] }),
          getUnassigned: sandbox.stub().returns({ credits: 1000, auctionInfo: [] }),
        });
      });
      afterEach(() => {
        sandbox.restore();
      });
      it('should update market data on load', () => {
        const highcharts = sandbox.stub(Highcharts, 'StockChart').returns({ destroy: sinon.spy() });
        const { actions } = setup();
        expect(actions.getMarketData.called).to.be.true;
        expect(highcharts.calledOnce).to.be.true;
      });

      it('should not update with same market data', () => {
        const highcharts = sandbox.stub(Highcharts, 'StockChart').returns({ destroy: sinon.spy() });
        const shouldUpdate = sandbox.spy(Overview.prototype, 'shouldComponentUpdate');
        const { component, actions } = setup();
        component.setProps({
          bid: {
            market: {
              data: [[1483760374000, 1000], [1483760434000, 1100]],
              flags: []
            }
          }
        });
        expect(shouldUpdate.returned(false)).to.be.true;
        expect(actions.getMarketData.calledOnce).to.be.true;
        expect(highcharts.calledOnce).to.be.true;
      });

      it('should update when bidding gets toggled', () => {
        const highcharts = sandbox.stub(Highcharts, 'StockChart').returns({ destroy: sinon.spy() });
        const shouldUpdate = sandbox.spy(Overview.prototype, 'shouldComponentUpdate');
        const { component, actions } = setup();
        expect(actions.getMarketData.calledOnce).to.be.true;
        expect(highcharts.calledOnce).to.be.true;
        component.setProps({ bidding: true });
        expect(shouldUpdate.returned(true)).to.be.true;
        expect(highcharts.calledTwice).to.be.true;
      });

      it('should update when given new market data', () => {
        const destroySpy = sandbox.spy();
        const highcharts = sandbox.stub(Highcharts, 'StockChart').returns({ destroy: destroySpy });
        const shouldUpdate = sandbox.spy(Overview.prototype, 'shouldComponentUpdate');
        const { component, actions } = setup({ account: { platform: 'ps4' } });
        expect(actions.getMarketData.calledOnce).to.be.true;
        expect(highcharts.calledOnce).to.be.true;
        component.setProps({
          bid: {
            market: {
              data: [[1483760434000, 1000], [1483760494000, 1100]],
              flags: []
            }
          }
        });
        expect(shouldUpdate.returned(true)).to.be.true;
        expect(highcharts.calledTwice).to.be.true;
        expect(destroySpy.calledOnce).to.be.true;
      });

      it('should call getMarketData() when pressing refresh button', () => {
        sandbox.stub(Highcharts, 'StockChart').returns({ destroy: sandbox.spy() });
        const { actions, buttons } = setup({
          bid: {
            market: {
              flags: [{
                color: '#000',
                fillColor: '#000',
                style: {
                  borderRadius: 5,
                  color: '#dcb20a'
                },
                text: 'test1',
                title: 'test1',
                x: 1483954260000
              }]
            }
          }
        });
        expect(buttons).to.have.length(2);
        expect(actions.getMarketData.calledOnce).to.be.true;
        buttons.at(0).simulate('click');
        expect(actions.getMarketData.calledTwice).to.be.true;
      });

      it('should call openExternal() when pressing market link button', () => {
        sandbox.stub(Highcharts, 'StockChart').returns({ destroy: sandbox.spy() });
        const { buttons } = setup();
        expect(buttons).to.have.length(2);
        buttons.at(1).simulate('click');
        expect(shell.openExternal.calledOnce).to.be.true;
        shell.openExternal.reset();
      });
    });
  });
});
