import React from 'react';
import { expect } from 'chai';
import sinon, { spy } from 'sinon';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Joyride from 'react-joyride';
import player, { totwPlayer } from '../mocks/player';
import { Players } from '../../app/containers/Players';
import ConnectedPlayerListItem from '../../app/components/player/PlayerListItem';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

function setup(initialState = { account: {} }, pathname = '/players') {
  const store = mockStore(initialState);
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
        isActive: spy()
      }
    },
    childContextTypes: {
      store: React.PropTypes.object,
      router: React.PropTypes.object
    }
  };
  const component = mount(
    <Players {...initialState} location={{ pathname }}><div /></Players>,
    context
  );
  return {
    component,
    context,
    database: component.find('.btn-database'),
    settings: component.find('.btn-preferences'),
    addPlayer: component.find('.btn-new'),
    sidebar: component.find('.sidebar-containers'),
    button: component.find('.create'),
    playerCards: component.find(ConnectedPlayerListItem)
  };
}

let sandbox;
describe('containers', () => {
  describe('Players', () => {
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      [
        'render',
        'componentDidMount',
        'componentWillReceiveProps',
        'componentWillUpdate',
        'componentDidUpdate',
        'componentWillUnmount'
      ].forEach(method => {
        sandbox.stub(Joyride.prototype, method).returns(null);
      });
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should call handleClickClearList when Clear List icon clicked', () => {
      const clear = spy();
      const { database } = setup({
        account: {
          credits: 1000
        },
        player: {
          list: {},
          search: {}
        },
        clear
      });
      expect(database).to.have.length(1);
      database.simulate('click');
      expect(clear.calledOnce).to.be.true;
    });

    it('should call context.router.push() when settings icon clicked', () => {
      const { settings, context } = setup({
        account: {
          credits: 1000
        },
        player: {
          list: {},
          search: {}
        }
      });
      expect(settings).to.have.length(1);
      settings.simulate('click');
      expect(context.context.router.push.calledOnce).to.be.true;
    });

    it('should not show search button when on /players', () => {
      const { button } = setup({
        account: {
          credits: 1000
        },
        player: {
          list: {},
          search: {}
        }
      });
      expect(button).to.have.length(1);
      expect(button.children().length).to.equal(0);
    });

    it('should show search button when not on /players', () => {
      const { button } = setup({
        account: {
          credits: 1000
        },
        player: {
          list: {},
          search: {}
        }
      }, '/players/20801');
      expect(button).to.have.length(1);
      expect(button.text()).to.equal('Search');
    });

    it('should call handleScroll when scroll event happens in sidebar', () => {
      const { component, sidebar } = setup({
        account: {
          credits: 1000
        },
        player: {
          list: {},
          search: {}
        }
      });
      expect(sidebar).to.have.length(1);
      expect(component.find('.sidebar-header').is('.sep')).to.be.false;
      sidebar.simulate('scroll', { target: { scrollTop: 100 } });
      component.update();
      expect(component.find('.sidebar-header').is('.sep')).to.be.true;
      sidebar.simulate('scroll', { target: { scrollTop: 101 } });
      component.update();
      expect(component.find('.sidebar-header').is('.sep')).to.be.true;
      sidebar.simulate('scroll', { target: { scrollTop: 0 } });
      component.update();
      expect(component.find('.sidebar-header').is('.sep')).to.be.false;
    });

    it('should render n PlayerListItem components where n is number of players in list', () => {
      const { playerCards } = setup({
        account: {
          credits: 1000
        },
        player: {
          list: {
            20801: player,
            67276528: totwPlayer
          },
          search: {}
        },
        history: {}
      });
      expect(playerCards).to.have.length(2);
    });
  });
});
