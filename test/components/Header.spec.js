import React from 'react';
import { expect } from 'chai';
import { stub, spy } from 'sinon';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { remote, currentWindowSpies } from '../mocks/electron';
import { Header } from '../../app/components/Header';
import util from '../../app/utils/Util';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

spy(Header.prototype, 'handleClose');
spy(Header.prototype, 'handleMinimize');
spy(Header.prototype, 'handleFullscreen');
spy(Header.prototype, 'handleUserClick');
spy(Header.prototype, 'handleDocumentKeyUp');

function setup(initialState) {
  const store = mockStore(initialState);
  const context = { context: { store, router: { push: spy() } } };
  const component = shallow(<Header {...initialState} updates={{ message: '' }} />, context);
  return {
    component,
    bordered: component.find('.bordered'),
    credits: component.find('.text'),
    close: component.find('.button-close'),
    minimize: component.find('.button-minimize'),
    fullscreen: component.find('.button-fullscreen'),
    user: component.find('.login')
  };
}


describe('components', () => {
  describe('Header', () => {
    it('should have no border if on login', () => {
      const { bordered } = setup({ hideLogin: true });
      expect(bordered).to.have.length(0);
    });

    it('should have a border if logged in', () => {
      const { bordered } = setup({ hideLogin: false, credits: 1000 });
      expect(bordered).to.have.length(1);
    });

    it('should display credits if logged in', () => {
      const { credits } = setup({ hideLogin: false, credits: 1000 });
      expect(credits).to.have.length(1);
    });

    it('should call hide() on close for non-Windows', () => {
      const isWindows = stub(util, 'isWindows').returns(false);
      const { component, close } = setup({ hideLogin: true });
      expect(close).to.have.length(1);
      close.simulate('click');
      isWindows.restore();
      expect(component.instance().handleClose.called).to.be.true;
    });

    it('should call close() on close for Windows', () => {
      const isWindows = stub(util, 'isWindows').returns(true);
      const { component, close } = setup({ hideLogin: true });
      expect(close).to.have.length(1);
      close.simulate('click');
      isWindows.restore();
      expect(component.instance().handleClose.called).to.be.true;
    });

    it('should call handleMinimize on minimize', () => {
      const isWindows = stub(util, 'isWindows').returns(false);
      const { component, minimize } = setup({ hideLogin: true });
      expect(minimize).to.have.length(1);
      minimize.simulate('click');
      isWindows.restore();
      expect(component.instance().handleMinimize.called).to.be.true;
    });

    it('should call handleFullscreen on fullscreen', () => {
      const isWindows = stub(util, 'isWindows').returns(false);
      const { component, fullscreen } = setup({ hideLogin: true });
      expect(fullscreen).to.have.length(1);
      fullscreen.simulate('click');
      isWindows.restore();
      expect(component.instance().handleFullscreen.called).to.be.true;
    });

    it('should call handleFullscreen on fullscreen (Windows)', () => {
      const isWindows = stub(util, 'isWindows').returns(true);
      const { component, fullscreen } = setup({ hideLogin: true });
      expect(fullscreen).to.have.length(1);
      fullscreen.simulate('click');
      expect(currentWindowSpies.maximize.called).to.be.true;
      remote.getCurrentWindow().maximize();
      fullscreen.simulate('click');
      expect(currentWindowSpies.unmaximize.called).to.be.true;
      expect(component.instance().handleFullscreen.called).to.be.true;
      isWindows.restore();
    });

    it('should exit fullscreen when esc is pressed if fullscreen enabled', () => {
      const currentWindow = remote.getCurrentWindow();
      currentWindow.setFullScreen(true);
      const { component } = setup({ hideLogin: true });
      component.instance().handleDocumentKeyUp({ keyCode: 27 });
      expect(currentWindow.isFullScreen()).to.be.false;
    });

    it('should do nothing when esc is pressed if fullscreen disabled', () => {
      const currentWindow = remote.getCurrentWindow();
      const { component } = setup({ hideLogin: true });
      component.instance().handleDocumentKeyUp({ keyCode: 27 });
      expect(currentWindow.isFullScreen()).to.be.false;
    });

    it('should call handleUserClick on user', () => {
      const { component, user } = setup({ hideLogin: false, credits: 1000 });
      expect(user).to.have.length(1);
      user.simulate('click', {
        currentTarget: {
          offsetLeft: 100,
          offsetTop: 20,
          clientHeight: 500
        }
      });
      expect(component.instance().handleUserClick.called).to.be.true;
      component.unmount();
    });
  });
});
