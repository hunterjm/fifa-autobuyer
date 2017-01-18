import _ from 'lodash';
import React from 'react';
import { expect } from 'chai';
import { spy, stub } from 'sinon';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import numeral from 'numeral';
import { PlayerListItem } from '../../../app/components/player/PlayerListItem';
import player from '../../mocks/player';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

spy(PlayerListItem.prototype, 'handleItemMouseEnter');
spy(PlayerListItem.prototype, 'handleItemMouseLeave');

function setup(active = false) {
  const actions = {
    remove: spy()
  };
  const store = mockStore({});
  const context = {
    context: {
      store,
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
  const component = shallow(<PlayerListItem player={player} {...actions} />, context);
  return {
    component,
    actions,
    li: component.find(`#${player.id}`),
    name: component.find('.name'),
    stats: component.find('.image'),
    remove: component.find('.btn.circular')
  };
}


describe('components', () => {
  describe('player', () => {
    describe('PlayerListItem', () => {
      it('should display player name', () => {
        const { name } = setup();
        expect(name).to.have.length(1);
        expect(name.text()).to.equal(player.name);
      });

      it('should display player stats', () => {
        const { stats } = setup();
        expect(stats).to.have.length(1);
        expect(stats.text()).to.equal(
          `${player.rating} | ${player.position}${numeral(_.get(player, 'price.buy')).format('0,0')}/${numeral(_.get(player, 'price.sell')).format('0,0')}/${numeral(_.get(player, 'price.bin')).format('0,0')}`
        );
      });

      it('should handle mouse events', () => {
        const { component, li } = setup();
        expect(li).to.have.length(1);
        li.simulate('mouseEnter');
        expect(component.instance().handleItemMouseEnter.called).to.be.true;
        li.simulate('mouseLeave');
        expect(component.instance().handleItemMouseLeave.called).to.be.true;
      });

      it('should call remove() when trying to delete player', () => {
        const { actions, remove } = setup(false);
        expect(remove).to.have.length(1);
        remove.simulate('click', { preventDefault: spy(), stopPropagation: spy() });
        expect(actions.remove.called).to.be.true;
      });

      it('should call push() when deleting a player while viewing details', () => {
        const { component, actions, remove } = setup(true);
        expect(remove).to.have.length(1);
        remove.simulate('click', { preventDefault: spy(), stopPropagation: spy() });
        expect(component.instance().context.router.push.called).to.be.true;
        expect(actions.remove.called).to.be.true;
      });
    });
  });
});
