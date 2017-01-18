import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { searchResults, searchResultsPg3 } from '../../mocks/search';
import { PlayerSearch } from '../../../app/components/player/PlayerSearch';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

function setup(initialState = {}) {
  const actions = {
    search: sinon.spy()
  };
  const store = mockStore({});
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
        isActive: sinon.stub().returns(true)
      }
    },
    childContextTypes: {
      store: React.PropTypes.object,
      router: React.PropTypes.object
    }
  };
  const component = mount(<PlayerSearch {...actions} {...initialState} />, context);
  return {
    component,
    actions,
    context,
    search: component.find('.search-bar .form-control')
  };
}

let clock;
describe('components', () => {
  describe('player', () => {
    describe('PlayerSearch', () => {
      beforeEach(() => {
        clock = sinon.useFakeTimers();
      });
      afterEach(() => {
        clock.restore();
      });
      it('should be focused on search input', () => {
        const { search } = setup();
        expect(search.node).to.equal(document.activeElement);
      });

      it('should call search() on input change', () => {
        const { search, actions } = setup();
        // This should return a result
        search.simulate('change', { target: { value: 'mes' } });
        clock.tick(500);
        // Calling it again should do nothing
        search.simulate('change', { target: { value: 'mes' } });
        clock.tick(500);
        // Searching for nothing, does nothing
        search.simulate('change', { target: { value: '' } });
        clock.tick(500);
        expect(actions.search.calledOnce).to.be.true;
      });

      it('should render pagination when available', () => {
        const { component, actions } = setup();
        component.setState({ query: 'mes' });
        component.setProps({ results: searchResults });
        const pages = component.find('.pagination').children();
        expect(pages).to.have.length(6);
        pages.at(2).find('a').simulate('click');
        // Nothing until timeout complete
        expect(actions.search.called).to.be.false;
        // Tick timeout clock
        clock.tick(500);
        // Search should be called
        expect(actions.search.calledOnce).to.be.true;
        component.setProps({ results: searchResultsPg3 });
      });

      it('should change routes and set state when filter clicked', () => {
        const { component, context } = setup();
        const filters = component.find('.results-filter.tab');
        expect(filters).to.have.length(1);
        filters.at(0).simulate('click');
        expect(context.context.router.push.calledOnce).to.be.true;
        expect(component.state('filter')).to.equal('players');
      });

      it('should show error when search fails', () => {
        const { component } = setup();
        component.setState({ error: true });
        const error = component.find('.no-results');
        expect(error).to.have.length(1);
        expect(error.text()).to.equal('There was an error searching.  Check your internet connection.');
      });

      it('should show error when no results found', () => {
        const { component } = setup();
        component.setState({ query: 'ardhdyjsfgba' });
        component.setProps({ results: { items: [] } });
        const error = component.find('.no-results');
        expect(error).to.have.length(1);
        expect(error.text()).to.equal('Cannot find a matching player.');
      });
    });
  });
});
