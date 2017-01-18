import React from 'react';
import { expect } from 'chai';
import { spy, stub } from 'sinon';
import { mount } from 'enzyme';
import { PlayerDetails } from '../../../app/components/player/PlayerDetails';
import player, { totwPlayer } from '../../mocks/player';

const shouldUpdate = spy(PlayerDetails.prototype, 'shouldComponentUpdate');

function setup(platform = 'xone', active = false) {
  const actions = {
    findPrice: spy()
  };
  const context = {
    context: {
      router: {
        push: spy(),
        replace: spy(),
        go: spy(),
        goBack: spy(),
        goForward: spy(),
        createHref: spy(),
        setRouteLeaveHook: spy(),
        isActive: stub().returns(active)
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
    platform,
    params: {
      id: player.id
    }
  };
  props.player.list[player.id] = player;
  props.player.list[totwPlayer.id] = totwPlayer;
  const component = mount(<PlayerDetails {...actions} {...props} />, context);
  return {
    component,
    actions,
    icons: {
      pc: component.find('.ut-icon-pc'),
      ps3: component.find('.ut-icon-ps3'),
      ps4: component.find('.ut-icon-ps4'),
      x360: component.find('.ut-icon-xbox-360'),
      xone: component.find('.ut-icon-xbox-one'),
    }
  };
}

describe('components', () => {
  describe('player', () => {
    describe('PlayerDetails', () => {
      it('should update price on load', () => {
        const { actions } = setup('pc');
        expect(actions.findPrice.called).to.be.true;
      });

      it('should not update with same params', () => {
        const { component, actions } = setup('ps3');
        component.setProps({ params: { id: player.id } });
        expect(shouldUpdate.returned(false)).to.be.true;
        expect(actions.findPrice.calledOnce).to.be.true;
      });

      it('should update when given new id', () => {
        const { component, actions } = setup('ps4');
        expect(actions.findPrice.calledOnce).to.be.true;
        component.setProps({ params: { id: totwPlayer.id } });
        expect(shouldUpdate.returned(true)).to.be.true;
        expect(actions.findPrice.calledTwice).to.be.true;
      });

      it('should show correct platform icons (xbox one)', () => {
        const { icons } = setup();
        expect(icons.x360.length).to.be.eql(0);
        expect(icons.xone.length).to.be.eql(1);
      });

      it('should show correct platform icons (xbox 360)', () => {
        const { icons } = setup('x360');
        expect(icons.x360.length).to.be.eql(1);
        expect(icons.xone.length).to.be.eql(0);
      });
    });
  });
});
