import { expect } from 'chai';
import { settings } from '../../app/reducers/settings';
import * as types from '../../app/actions/settingsTypes';


describe('reducers', () => {
  describe('settings', () => {
    it('should handle initial state', () => {
      expect(settings(undefined, {})).to.eql({
        rpm: '10',
        minCredits: '1000',
        maxCard: '10',
        autoStop: '0',
        snipeOnly: false,
        bidUntilMin: 5,
        skipTutorial: false,
        autoUpdate: true,
        buy: '90',
        sell: '100',
        bin: '110',
        relistAll: false
      });
    });

    it('should handle SET_SETTING', () => {
      const value = '15';
      expect(
        settings({ rpm: '10' }, { type: types.SET_SETTING, key: 'rpm', value })
      ).to.eql({ rpm: value });
    });

    it('should handle unknown action type', () => {
      expect(
        settings({ settings: {} }, { type: 'unknown' })
      ).to.eql({ settings: {} });
    });
  });
});
