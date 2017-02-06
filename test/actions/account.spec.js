import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';
import Fut from 'fut-promise';
import * as ApiUtil from '../../app/utils/ApiUtil';
import * as actions from '../../app/actions/account';
import * as types from '../../app/actions/accountTypes';

const email = 'test@test.com';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let sandbox;
describe('actions', () => {
  describe('account', () => {
    describe('creators', () => {
      it('should create SET_ACCOUNT_INFO action when setAccountInfo() is called', () => {
        const key = 'email';
        const value = 'test@test.com';
        expect(actions.setAccountInfo(key, value)).to.eql(
          { type: types.SET_ACCOUNT_INFO, key, value }
        );
      });

      it('should create SET_CREDITS action when setCredits() is called', () => {
        const credits = 1000;
        expect(actions.setCredits(credits)).to.eql(
          { type: types.SET_CREDITS, credits }
        );
      });

      it('should create SET_PILESIZE action when setPilesize() is called', () => {
        const { key, value } = { key: 'tradepile', value: 30 };
        expect(actions.setPilesize(key, value)).to.eql(
          { type: types.SET_PILESIZE, key, value }
        );
      });
    });
    describe('async creators', () => {
      beforeEach(() => {
        sandbox = sinon.sandbox.create();
      });
      afterEach(() => {
        sandbox.restore();
      });

      it('should route to /players when login was success', async () => {
        const loginStub = sandbox.stub(Fut.prototype, 'login').returns({
          pileSizeClientData: {
            entries: [{
              key: 2,
              value: 30
            }, {
              key: 4,
              value: 30
            }, {
              key: 6,
              value: 15
            }]
          },
          userInfo: {
            credits: 10243,
            feature: { trade: 2 },
          }
        });
        const account = {
          email,
          password: 'Password1',
          secret: 'test',
          platform: 'xone'
        };
        const store = mockStore({ account });

        await store.dispatch(actions.login(account));
        expect(loginStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.include({
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/players'] }
        });
      });

      it('should dispatch SET_CREDITS when getCredits is completed', async () => {
        // Mock credits response
        const credits = 1000;
        const getCreditsStub = sandbox.stub().returns({ credits });
        const getApiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getCredits: getCreditsStub
        });

        const store = mockStore({});

        await store.dispatch(actions.getCredits(email));
        expect(getApiStub.calledOnce).to.eql(true);
        expect(getCreditsStub.calledOnce).to.eql(true);
        expect(store.getActions()).to.include(actions.setCredits(credits));
      });

      it('should dispatch SET_PILESIZE when getPilesize is completed', async () => {
        // Mock pilesize response
        const response = {
          entries: [{ key: 2, value: 30 }, { key: 4, value: 30 }, { key: 6, value: 15 }]
        };
        const getPilesizeStub = sandbox.stub().returns(response);
        const getApiStub = sandbox.stub(ApiUtil, 'getApi').returns({
          getPilesize: getPilesizeStub
        });

        const store = mockStore({});

        await store.dispatch(actions.getPilesize(email));
        expect(getApiStub.calledOnce).to.eql(true);
        expect(getPilesizeStub.calledOnce).to.eql(true);
        const reduxActions = store.getActions();
        expect(reduxActions).to.include(
          actions.setPilesize('tradepile', response.entries[0].value)
        );
        expect(reduxActions).to.include(
          actions.setPilesize('watchlist', response.entries[1].value)
        );
      });
    });
  });
});
