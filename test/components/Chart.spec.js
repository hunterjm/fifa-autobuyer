import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import Highcharts from 'highcharts/highstock';
import Chart from '../../app/components/Chart';

function setup(type = 'StockChart', modules = []) {
  const props = {
    container: 'live_graph',
    type,
    options: {},
    modules,
  };
  return mount(<Chart {...props} />);
}
let sandbox;
describe('components', () => {
  describe('Chart', () => {
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should apply provided modules', () => {
      const destroySpy = sandbox.spy();
      const moduleSpy = sandbox.spy();
      sandbox.stub(Highcharts, 'Chart').returns({ destroy: destroySpy });
      setup('Chart', [moduleSpy]);
      expect(moduleSpy.calledOnce).to.be.true;
    });

    it('should destroy chart on unmount', () => {
      const destroySpy = sandbox.spy();
      sandbox.stub(Highcharts, 'StockChart').returns({ destroy: destroySpy });
      const component = setup();
      component.unmount();
      expect(destroySpy.calledOnce).to.be.true;
    });
  });
});
