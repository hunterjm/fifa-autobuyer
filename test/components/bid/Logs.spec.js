import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Logs } from '../../../app/components/bid/Logs';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

function setup(logs) {
  const actions = {
    clearMessages: sinon.spy(),
    start: sinon.spy(),
    stop: sinon.spy()
  };
  const initialState = {
    bid: {
      bidding: false,
      logs,
    }
  };
  const props = {
    bidding: initialState.bid.bidding,
    logs: initialState.bid.logs,
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
        isActive: sinon.stub().returns(true)
      }
    },
    childContextTypes: {
      store: React.PropTypes.object,
      router: React.PropTypes.object
    }
  };
  const component = mount(<Logs {...actions} {...props} {...initialState} />, context);
  return {
    component,
    actions,
    logs: component.find('.logs')
  };
}

let sandbox;
describe('components', () => {
  describe('bid', () => {
    describe('Logs', () => {
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
      });
      afterEach(() => {
        sandbox.restore();
      });

      it('should display empty message if no logs', () => {
        const handleResizeStub = sandbox.stub(Logs.prototype, 'handleResize');
        const { logs } = setup([]);
        expect(logs.children().length).to.eql(0);
        expect(handleResizeStub.calledOnce).to.eql(true);
      });

      it('should display log messages correctly', () => {
        const handleResizeStub = sandbox.stub(Logs.prototype, 'handleResize');
        const { logs } = setup([
          { level: 'log', msg: 'log' },
          { level: 'warn', msg: 'warning' },
          { level: 'error', msg: 'error', error: { code: 500 } },
        ]);
        const lines = logs.children();
        expect(lines.length).to.eql(3);
        expect(lines.at(0).prop('className')).to.eql('log');
        expect(lines.at(1).prop('className')).to.eql('warn');
        expect(lines.at(2).prop('className')).to.eql('error');
        expect(lines.at(2).find('pre').length).to.eql(1);
        expect(handleResizeStub.calledOnce).to.eql(true);
      });

      it('should update when a log is added', () => {
        const componentDidUpdateSpy = sandbox.spy(Logs.prototype, 'componentDidUpdate');
        const handleResizeStub = sandbox.stub(Logs.prototype, 'handleResize');
        const { component, logs } = setup([
          { level: 'log', msg: 'log' },
          { level: 'warn', msg: 'warning' },
          { level: 'error', msg: 'error', error: { code: 500 } },
        ]);
        const lines = logs.children();
        expect(lines.length).to.eql(3);
        expect(handleResizeStub.calledOnce).to.eql(true);
        component.setProps({ logs: [] });
        expect(componentDidUpdateSpy.calledOnce).to.eql(true);
        expect(handleResizeStub.calledTwice).to.eql(true);
        component.unmount();
      });

      it('should clear messages when action is clicked', () => {
        sandbox.stub(Logs.prototype, 'handleResize');
        const { component, actions } = setup([]);
        component.find('.action').at(1).simulate('click'); // Header has some actions too
        expect(actions.clearMessages.calledOnce).to.eql(true);
      });
    });
  });
});
