import { expect } from 'chai';
import { player } from '../../app/reducers/player';
import * as types from '../../app/actions/playerTypes';
import * as bidTypes from '../../app/actions/bidTypes';


describe('reducers', () => {
  describe('player', () => {
    it('should handle initial state', () => {
      expect(player(undefined, {})).to.eql({
        search: {},
        list: {}
      });
    });

    it('should handle SAVE_SEARCH_RESULTS', () => {
      const results = {
        count: 3,
        items: [
          { id: '158023' },
          { id: '202350' },
          { id: '224286' }
        ],
        page: 1,
        totalPages: 1,
        totalResults: 3,
        type: 'FUTPlayerItemList'
      };
      expect(
        player({ search: { items: [{ id: '123456' }] } }, { type: types.SAVE_SEARCH_RESULTS, results })
      ).to.eql(
        { search: results }
      );
    });

    it('should handle ADD_PLAYER on empty list', () => {
      const nextState = player(undefined, { type: types.ADD_PLAYER, player: { id: '123456' } });
      expect(nextState.list).to.have.all.keys('123456');
    });

    it('should handle ADD_PLAYER on existing list', () => {
      const initialState = {
        list: {
          123456: { id: '123456' }
        }
      };
      const nextState = player(initialState, { type: types.ADD_PLAYER, player: { id: '158023' } });
      expect(nextState.list).to.have.all.keys(['123456', '158023']);
    });

    it('should handle REMOVE_PLAYER', () => {
      const initialState = {
        list: {
          123456: { id: '123456' },
          158023: { id: '158023' }
        }
      };
      const nextState = player(initialState, { type: types.REMOVE_PLAYER, player: { id: '158023' } });
      expect(nextState.list).to.have.all.keys('123456');
    });

    it('should handle CLEAR_LIST', () => {
      const initialState = {
        list: {
          123456: { id: '123456' },
          158023: { id: '158023' }
        }
      };
      const nextState = player(initialState, { type: types.CLEAR_LIST });
      expect(nextState.list).to.be.eql({});
    });

    it('should handle SET_PRICE', () => {
      const initialState = {
        list: {
          123456: { id: '123456' },
          158023: { id: '158023' }
        }
      };
      const nextState = player(initialState, {
        type: types.SET_PRICE,
        id: 158023,
        price: { lowest: 750000, total: 1 }
      });
      expect(nextState.list).to.eql({
        123456: { id: '123456' },
        158023: {
          id: '158023',
          price: { lowest: 750000, total: 1 }
        }
      });
    });

    it('should handle UPDATE_PLAYER_HISTORY (add new history)', () => {
      const initialState = {
        list: {
          123456: { id: '123456' },
          158023: {
            id: '158023',
            history: { 123456789: { id: 123456789, bought: 1000, boughtAt: 987654321 } }
          }
        }
      };
      const nextState = player(initialState, {
        type: bidTypes.UPDATE_PLAYER_HISTORY,
        id: 158023,
        history: { id: 987654321, bought: 1100, boughtAt: 9786756453 }
      });
      expect(nextState.list).to.eql({
        123456: { id: '123456' },
        158023: {
          id: '158023',
          history: {
            123456789: { id: 123456789, bought: 1000, boughtAt: 987654321 },
            987654321: { id: 987654321, bought: 1100, boughtAt: 9786756453 }
          }
        }
      });
    });

    it('should handle UPDATE_PLAYER_HISTORY (modify existing)', () => {
      const initialState = {
        list: {
          123456: { id: '123456' },
          158023: {
            id: '158023',
            history: { 123456789: { id: 123456789, bought: 1000, boughtAt: 123456789 } }
          }
        }
      };
      const nextState = player(initialState, {
        type: bidTypes.UPDATE_PLAYER_HISTORY,
        id: 158023,
        history: { id: 123456789, sold: 1200, soldAt: 987654321 }
      });
      expect(nextState.list).to.eql({
        123456: { id: '123456' },
        158023: {
          id: '158023',
          history: {
            123456789: {
              id: 123456789,
              bought: 1000,
              boughtAt: 123456789,
              sold: 1200,
              soldAt: 987654321
            }
          }
        }
      });
    });

    it('should handle unknown action type', () => {
      expect(
        player({ player: {} }, { type: 'unknown' })
      ).to.eql({ player: {} });
    });
  });
});
