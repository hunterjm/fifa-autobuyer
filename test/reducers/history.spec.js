import { expect } from 'chai';
import { history } from '../../app/reducers/history';
import * as bidTypes from '../../app/actions/bidTypes';


describe('reducers', () => {
  describe('history', () => {
    it('should handle initial state', () => {
      expect(history(undefined, {})).to.eql({});
    });

    it('should handle UPDATE_PLAYER_HISTORY (add new history)', () => {
      const initialState = {
        158023: {
          123456789: { id: 123456789, bought: 1000, boughtAt: 987654321 }
        }
      };
      const nextState = history(initialState, {
        type: bidTypes.UPDATE_PLAYER_HISTORY,
        id: 158023,
        history: { id: 987654321, bought: 1100, boughtAt: 9786756453 }
      });
      expect(nextState).to.eql({
        158023: {
          123456789: { id: 123456789, bought: 1000, boughtAt: 987654321 },
          987654321: { id: 987654321, bought: 1100, boughtAt: 9786756453 }
        }
      });
    });

    it('should handle UPDATE_PLAYER_HISTORY (modify existing)', () => {
      const initialState = {
        158023: {
          123456789: { id: 123456789, bought: 1000, boughtAt: 123456789 }
        }
      };
      const nextState = history(initialState, {
        type: bidTypes.UPDATE_PLAYER_HISTORY,
        id: 158023,
        history: { id: 123456789, sold: 1200, soldAt: 987654321 }
      });
      expect(nextState).to.eql({
        158023: {
          123456789: {
            id: 123456789,
            bought: 1000,
            boughtAt: 123456789,
            sold: 1200,
            soldAt: 987654321
          }
        }
      });
    });

    it('should handle unknown action type', () => {
      expect(
        history({ history: {} }, { type: 'unknown' })
      ).to.eql({ history: {} });
    });
  });
});
