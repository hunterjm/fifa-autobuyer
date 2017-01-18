import $ from 'jquery';
import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Fut from 'fut-promise';
import * as BidActions from '../../actions/bid';

export class Transfers extends Component {
  constructor(props) {
    super(props);
    this.counter = undefined;
  }

  componentDidMount() {
    this.counter = window.setInterval(() => {
      /* istanbul ignore next */
      $('.expires').each(function countdown() {
        const expires = parseInt($(this).text(), 10);
        if (expires > 0) {
          $(this).text(expires - 1);
        }
      });
    }, 1000);
    if (this.props && !this.props.bidding) {
      this.props.getWatchlist(this.props.email);
      this.props.getTradepile(this.props.email);
      this.props.getUnassigned(this.props.email);
    }
  }

  shouldComponentUpdate() {
    // TODO: figure out when this needs to update (hint: not always)
    return true;
  }

  componentWillUnmount() {
    window.clearInterval(this.counter);
    this.counter = undefined;
  }

  render() {
    const watchlist = _.get(this.props.bid, 'watchlist', []);
    const tradepile = _.get(this.props.bid, 'tradepile', []);
    const unassigned = _.get(this.props.bid, 'unassigned', []);

    return (
      <div className="wrapper">
        <div className="widget">
          <div className="top-bar">
            <div className="text">
              Buying <small>({watchlist.length}/{this.props.pilesize.watchlist})</small>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Max Price</th>
                <th>List Price</th>
                <th>BIN Price</th>
                <th>Current Bid</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {_.map(
                watchlist,
                item => {
                  const player = _.get(
                    this.props.player,
                    `list.${Fut.getBaseId(item.itemData.resourceId)}`,
                    {
                      name: 'Unknown',
                      price: { buy: 'N/A' }
                    }
                  );
                  const rowClass = classNames({
                    success: item.bidState === 'highest',
                    warning: item.bidState !== 'highest' && item.currentBid < player.price.buy && item.expires > -1,
                    danger: item.bidState !== 'highest' && (item.expires === -1 || item.currentBid >= player.price.buy),
                  });
                  return (
                    <tr key={`watchlist-${item.itemData.id}`} className={rowClass}>
                      <td>{player.name}</td>
                      <td>{item.bidState}</td>
                      <td>{player.price.buy}</td>
                      <td>{item.startingBid}</td>
                      <td>{item.buyNowPrice}</td>
                      <td>{item.currentBid}</td>
                      <td className="expires">{item.expires}</td>
                    </tr>
                  );
                }
              )}
              {
                watchlist.length === 0
                ? <tr><td colSpan="7" style={{ textAlign: 'center' }}><small>No Watched Items</small></td></tr>
                : null
              }
            </tbody>
          </table>
        </div>
        <div className="widget">
          <div className="top-bar">
            <div className="text">
              Selling <small>({tradepile.length}/{this.props.pilesize.tradepile})</small>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Bought For</th>
                <th>List Price</th>
                <th>BIN Price</th>
                <th>Current Bid</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {_.map(
                tradepile,
                item => {
                  const player = _.get(
                    this.props.player,
                    `list.${Fut.getBaseId(item.itemData.resourceId)}`,
                    { name: 'Unknown' }
                  );
                  const rowClass = classNames({
                    success: item.itemData.itemState === 'invalid' && item.expires === -1,
                    danger: item.itemData.itemState !== 'invalid' && item.expires === -1,
                  });
                  return (
                    <tr key={`tradepile-${item.itemData.id}`} className={rowClass}>
                      <td>{player.name}</td>
                      <td>
                        {
                          item.itemData.itemState === 'invalid'
                          ? 'sold'
                          : item.itemData.itemState
                        }
                      </td>
                      <td>{item.itemData.lastSalePrice || 'N/A'}</td>
                      <td>{item.startingBid}</td>
                      <td>{item.buyNowPrice}</td>
                      <td>{item.currentBid}</td>
                      <td className="expires">{item.expires}</td>
                    </tr>
                  );
                }
              )}
              {
                tradepile.length === 0
                ? <tr><td colSpan="7" style={{ textAlign: 'center' }}><small>No Listed Items</small></td></tr>
                : null
              }
            </tbody>
          </table>
        </div>
        <div className="widget">
          <div className="top-bar">
            <div className="text">
              Unassigned
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Bought For</th>
                <th>List Price</th>
                <th>BIN Price</th>
                <th>Current Bid</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              {_.map(
                unassigned,
                item => {
                  const player = _.get(
                    this.props.player,
                    `list.${Fut.getBaseId(item.resourceId)}`,
                    {
                      name: 'Unknown',
                      price: { buy: 'N/A', sell: 'N/A' }
                    }
                  );
                  return (
                    <tr key={`unassigned-${item.id}`}>
                      <td>{player.name}</td>
                      <td>{item.itemState}</td>
                      <td>{item.lastSalePrice || 'N/A'}</td>
                      <td>{player.price.sell}</td>
                      <td>{player.price.bin}</td>
                      <td>N/A</td>
                      <td>N/A</td>
                    </tr>
                  );
                }
              )}
              {
                unassigned.length === 0
                ? <tr><td colSpan="7" style={{ textAlign: 'center' }}><small>No Unassigned Items</small></td></tr>
                : null
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

Transfers.propTypes = {
  player: PropTypes.shape({
    list: PropTypes.shape({})
  }),
  bid: PropTypes.shape({}),
  bidding: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  email: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  pilesize: PropTypes.shape({
    watchlist: PropTypes.number.isRequired,
    tradepile: PropTypes.number.isRequired,
  }),
  getWatchlist: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getTradepile: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getUnassigned: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

function mapStateToProps(state) {
  return {
    player: state.player,
    bid: state.bid,
    bidding: state.bid.bidding,
    email: state.account.email,
    pilesize: state.account.pilesize,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BidActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Transfers);
