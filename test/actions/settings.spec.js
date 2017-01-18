import { expect } from 'chai';
import * as actions from '../../app/actions/settings';
import * as types from '../../app/actions/settingsTypes';

describe('actions', () => {
  describe('settings', () => {
    it('should create SET_SETTING action when setSetting() is called', () => {
      const key = 'rpm';
      const value = '15';
      expect(actions.setSetting(key, value)).to.eql(
        { type: types.SET_SETTING, key, value }
      );
    });
  });
});
