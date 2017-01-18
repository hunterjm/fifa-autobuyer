import React from 'react';
import { expect } from 'chai';
import { spy, stub } from 'sinon';
import { shallow } from 'enzyme';
import Header from '../../../app/components/bid/Header';

function setup(bidding = false, history = false) {
  const props = {
    bidding,
    start: spy(),
    stop: spy()
  };
  const router = {
    push: spy(),
    replace: spy(),
    go: spy(),
    goBack: spy(),
    goForward: spy(),
    createHref: spy(),
    setRouteLeaveHook: spy(),
    isActive: stub().returns(history)
  };
  const component = shallow(<Header router={router} {...props} />);
  return {
    component,
    props,
    buttons: component.find('.action')
  };
}

describe('components', () => {
  describe('bid', () => {
    describe('Header', () => {
      it('should show start button and call start() when clicked if not bidding', () => {
        const { props, buttons } = setup();
        expect(buttons).to.have.length(1);
        buttons.at(0).simulate('click');
        expect(props.start.calledOnce).to.be.true;
      });

      it('should show stop button and call stop() when clicked if bidding', () => {
        const { props, buttons } = setup(true);
        expect(buttons).to.have.length(1);
        buttons.at(0).simulate('click');
        expect(props.stop.calledOnce).to.be.true;
      });

      // TODO: Once history tab is added, test that it's active when clicked
    });
  });
});
