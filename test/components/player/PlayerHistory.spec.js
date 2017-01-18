import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import Highcharts from 'highcharts/highstock';
import { PlayerHistory } from '../../../app/components/player/PlayerHistory';
import player, { totwPlayer } from '../../mocks/player';

function setup(active = false) {
  const actions = {
    findPrice: sinon.spy(),
    getMarketData: sinon.spy()
  };
  const context = {
    context: {
      router: {
        push: sinon.spy(),
        replace: sinon.spy(),
        go: sinon.spy(),
        goBack: sinon.spy(),
        goForward: sinon.spy(),
        createHref: sinon.spy(),
        setRouteLeaveHook: sinon.spy(),
        isActive: sinon.stub().returns(active)
      }
    },
    childContextTypes: {
      store: React.PropTypes.object,
      router: React.PropTypes.object
    }
  };
  const props = {
    account: {},
    player: {
      list: {},
      search: {}
    },
    market: {
      data: [[1483760374000, 1000], [1483760434000, 1100]],
      flags: []
    },
    platform: 'xone',
    params: {
      id: player.id
    }
  };
  props.player.list[player.id] = player;
  props.player.list[totwPlayer.id] = totwPlayer;
  const component = mount(<PlayerHistory {...actions} {...props} />, context);
  return {
    component,
    actions
  };
}
let sandbox;
describe('components', () => {
  describe('player', () => {
    describe('PlayerHistory', () => {
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
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

      it('should not update with same params', () => {
        const highcharts = sandbox.stub(Highcharts, 'StockChart').returns({ destroy: sinon.spy() });
        const shouldUpdate = sandbox.spy(PlayerHistory.prototype, 'shouldComponentUpdate');
        const { component, actions } = setup();
        component.setProps({ params: { id: player.id } });
        expect(shouldUpdate.returned(false)).to.be.true;
        expect(actions.getMarketData.calledOnce).to.be.true;
        expect(highcharts.calledOnce).to.be.true;
      });

      it('should update when given new id', () => {
        const highcharts = sandbox.stub(Highcharts, 'StockChart').returns({ destroy: sinon.spy() });
        const shouldUpdate = sandbox.spy(PlayerHistory.prototype, 'shouldComponentUpdate');
        const { component, actions } = setup();
        expect(actions.getMarketData.calledOnce).to.be.true;
        expect(highcharts.calledOnce).to.be.true;
        component.setProps({ params: { id: totwPlayer.id } });
        expect(shouldUpdate.returned(true)).to.be.true;
        expect(actions.getMarketData.calledTwice).to.be.true;
        expect(highcharts.calledTwice).to.be.true;
      });

      it('should update when given new market data', () => {
        const destroySpy = sandbox.spy();
        const highcharts = sandbox.stub(Highcharts, 'StockChart').returns({ destroy: destroySpy });
        const shouldUpdate = sandbox.spy(PlayerHistory.prototype, 'shouldComponentUpdate');
        const { component, actions } = setup();
        expect(actions.getMarketData.calledOnce).to.be.true;
        expect(highcharts.calledOnce).to.be.true;
        component.setProps({
          market: {
            data: [[1483760434000, 1000], [1483760494000, 1100]],
            flags: []
          }
        });
        expect(shouldUpdate.returned(true)).to.be.true;
        // We don't update market data again for the same player
        expect(actions.getMarketData.calledTwice).to.be.false;
        expect(highcharts.calledTwice).to.be.true;
        expect(destroySpy.calledOnce).to.be.true;
      });
    });
  });
});
