import { expect } from 'chai';
import { bid, initialState } from '../../app/reducers/bid';
import * as types from '../../app/actions/bidTypes';


describe('reducers', () => {
  describe('player', () => {
    it('should handle initial state', () => {
      expect(bid(undefined, {})).to.eql(initialState);
    });

    it('should handle START_BIDDING', () => {
      expect(
        bid({ bidding: false }, { type: types.START_BIDDING })
      ).to.eql(
        { bidding: true }
      );
    });

    it('should handle STOP_BIDDING', () => {
      expect(
        bid({ bidding: true }, { type: types.STOP_BIDDING })
      ).to.eql(
        { bidding: false }
      );
    });

    it('should handle SET_CYCLES', () => {
      const cycles = 4;
      expect(
        bid({ bidding: true }, { type: types.SET_CYCLES, count: cycles })
      ).to.eql(
        { bidding: true, cycles }
      );
    });

    it('should handle SET_WATCHLIST', () => {
      const watchlist = [{}, {}];
      expect(
        bid(
          { bidding: false, watchlist: [{ fake: 'data' }] },
          { type: types.SET_WATCHLIST, watchlist }
        )
      ).to.eql(
        { bidding: false, watchlist }
      );
    });

    it('should handle SET_TRADEPILE', () => {
      const tradepile = [{}, {}, {}];
      expect(
        bid(
          { bidding: false, tradepile: [{ fake: 'data' }] },
          { type: types.SET_TRADEPILE, tradepile }
        )
      ).to.eql(
        { bidding: false, tradepile }
      );
    });

    it('should handle SET_UNASSIGNED', () => {
      const unassigned = [{}];
      expect(
        bid(
          { bidding: false, unassigned: [{ fake: 'data' }] },
          { type: types.SET_UNASSIGNED, unassigned }
        )
      ).to.eql(
        { bidding: false, unassigned }
      );
    });

    it('should handle SAVE_MARKET_DATA', () => {
      const market = { data: [[1234567, 123], [54323456, 135]], flags: [] };
      expect(
        bid(
          { bidding: false, market: { data: [], flags: [] } },
          { type: types.SAVE_MARKET_DATA, market }
        )
      ).to.eql(
        { bidding: false, market }
      );
    });

    it('should handle SET_WATCH', () => {
      const watched = { 12345: 2, 67890: 1 };
      expect(
        bid(
          { bidding: false, watched: { 5367: 12 } },
          { type: types.SET_WATCH, watched }
        )
      ).to.eql(
        { bidding: false, watched }
      );
    });

    it('should handle UPDATE_WATCH', () => {
      const watched = { 12345: 2, 67890: 2 };
      expect(
        bid(
          { bidding: false, watched: { 12345: 2, 67890: 1 } },
          { type: types.UPDATE_WATCH, id: 67890, count: 2 }
        )
      ).to.eql(
        { bidding: false, watched }
      );
    });

    it('should handle SET_LISTED', () => {
      const listed = { 12345: 2, 67890: 1 };
      expect(
        bid(
          { bidding: false, listed: { 5367: 12 } },
          { type: types.SET_LISTED, listed }
        )
      ).to.eql(
        { bidding: false, listed }
      );
    });

    it('should handle UPDATE_LISTED', () => {
      const listed = { 12345: 2, 67890: 2 };
      expect(
        bid(
          { bidding: false, listed: { 12345: 2, 67890: 1 } },
          { type: types.UPDATE_LISTED, id: 67890, count: 2 }
        )
      ).to.eql(
        { bidding: false, listed }
      );
    });

    it('should handle SET_TRADES', () => {
      const trades = { 12345678: { expires: 123 } };
      expect(
        bid(
          { bidding: false, trades: { 12345678: { expires: 223 } } },
          { type: types.SET_TRADES, trades }
        )
      ).to.eql(
        { bidding: false, trades }
      );
    });

    it('should handle UPDATE_TRADES', () => {
      const trades = { 12345678: { expires: 123 }, 7466521: { expires: 1235 } };
      expect(
        bid(
          { bidding: false, trades: { 12345678: { expires: 223 }, 7466521: { expires: 1235 } } },
          { type: types.UPDATE_TRADES, id: 12345678, tradeResult: { expires: 123 } }
        )
      ).to.eql(
        { bidding: false, trades }
      );
    });

    it('should handle SET_BIN_STATUS', () => {
      expect(
        bid({ binWon: false }, { type: types.SET_BIN_STATUS, won: true })
      ).to.eql(
        { binWon: true }
      );
    });
  });
});
