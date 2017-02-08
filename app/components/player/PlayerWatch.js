import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import ss from 'simple-statistics';
import numeral from 'numeral';
import Header from './Header';
import PlayerCard from './PlayerCard';
import PlatformIcon from '../PlatformIcon';
import * as WatchActions from '../../actions/watch';

export class PlayerWatch extends Component {
  constructor(props) {
    super(props);
    this.player = props.player.list[props.params.id];
  }

  componentDidMount() {
    this.props.start(this.player);
  }

  shouldComponentUpdate(nextProps) {
    const watched = JSON.stringify(_.get(this.props.watch, `trades[${this.props.params.id}]`, {}));
    const nextWatched = JSON.stringify(_.get(nextProps.watch, `trades[${this.props.params.id}]`, {}));
    const price = JSON.stringify(_.get(this.props.player, `list[${this.props.params.id}].price`, {}));
    const nextPrice = JSON.stringify(_.get(nextProps.player, `list[${this.props.params.id}].price`, {}));

    if (nextWatched === watched && nextPrice === price) {
      return false;
    }
    return true;
  }

  componentWillUnmount() {
    this.props.stop();
  }

  render() {
    const player = this.player;
    let playerName;
    if (player.commonName) {
      playerName = player.commonName;
    } else {
      playerName = `${player.firstName} ${player.lastName}`;
    }

    // Do maths
    const watched = Object.values(_.get(this.props.watch, `trades[${player.id}]`, {}));
    const remaining = watched.filter(trade => trade.expires > 0);
    const expired = watched.filter(trade => trade.expires <= 0);
    const active = remaining.filter(trade => trade.currentBid > 0);
    const sold = expired.filter(trade => trade.currentBid > 0);
    const soldPrice = sold.map(trade => trade.currentBid);
    const unsoldPrice = expired
      .filter(trade => !trade.currentBid)
      .map(trade => trade.startingBid);

    return (
      <div className="details player-screen">
        <Header
          player={this.player}
          router={this.context.router}
        />
        <div className="details-panel home">
          <div className="content">
            <div className="full">
              <div className="ut-bio ut-underlay">
                <div className="ut-body-inner">
                  <div className="ut-bio-details ut-bio-details--no-prices">
                    <div className="ut-bio-details_group">
                      <div className="ut-item-container">
                        <div className="ut-item-container_header">
                          <PlayerCard player={player} />
                        </div>
                      </div>
                      <svg id="ut-polygons-bio" className="ut-icon ut-polygons-bio" viewBox="0 0 3840 3840">
                        <path className="svg-polygons-bio-1 svg-polygons-dark" d="M1529.32 1726.81c-.29.06-.58.11-.87.17l1897.2-1897.191.35.35zm-14.62 3.4L3420.38-175.474l.53.526L1516.14 1729.82zm-15.34 4.81L3415.12-180.737l.7.7L1501.53 1734.26c-.72.25-1.45.5-2.17.76zm-18.53 7.66L3409.68-186.175l.88.877L1484.1 1741.16c-1.1.49-2.19 1.01-3.27 1.52zm-22.63 12.45L3404.59-191.263l1.06 1.053L1463.63 1751.8c-1.82 1.09-3.64 2.19-5.43 3.33zM-143.877 3345.98L3398.98-196.877l1.4 1.4L-142.473 3347.38zm-5.262-5.26L3393.72-202.139l1.58 1.578L-147.561 3342.3zm-5.263-5.27L3388.45-207.4l1.76 1.754L-152.648 3337.21zm-5.263-5.26L3383.19-212.665l1.93 1.93L-157.735 3332.12zm-5.438-5.44L3377.75-218.1l2.11 2.105L-163 3326.86zm-4.562-4.56L3373.19-222.665l2.28 2.281L-167.384 3322.47zm-4.736-4.73L3368.46-227.4l2.45 2.456L-171.945 3317.91zm-4.561-4.57L3363.89-231.962l2.46 2.456L-176.506 3313.35zm-4.737-4.73L3359.16-236.7l2.81 2.807L-180.892 3308.97zm-4.561-4.56L3354.6-241.26l2.8 2.807L-185.453 3304.4zm-4.737-4.74L3349.86-246l3.16 3.158L-189.839 3300.02zM1390.8 1824.63L-137.21 3352.65l-1.053-1.06L1394.13 1819.2c-1.14 1.79-2.24 3.61-3.33 5.43zm-10.64 20.47L-132.3 3357.56l-.877-.88L1381.68 1841.83c-.51 1.08-1.03 2.17-1.52 3.27zm-6.9 17.43L-127.035 3362.82l-.7-.7L1374.02 1860.36c-.26.72-.51 1.45-.76 2.17zm-4.44 14.61L-121.948 3367.91l-.526-.53L1369.21 1875.7zm-3.01 13.18L-116.861 3373l-.35-.35 1483.191-1483.2c-.06.29-.11.58-.17.87z" />
                        <path className="svg-polygons-bio-2 svg-polygons-light" d="M2676.73 1938.98l-223 222.73-4.25.01 223.01-222.75z" />
                        <path className="svg-polygons-bio-3 svg-polygons-light" d="M1698.48 1487.98l-301.76 302.23-5.74.01 301.76-302.26z" />
                        <path className="svg-polygons-bio-4 svg-polygons-light" d="M1506.48 1690.47l-129.53 129.74-2.47.01 129.54-129.75h2.46z" />
                        <path className="svg-polygons-bio-5 svg-polygons-light" d="M530.982 4059.84L3977.84 612.982l3.16 3.157L534.139 4063zm-4.386-4.39L3973.45 608.6l2.81 2.807L529.4 4058.26zm-4.561-4.56L3968.89 604.035l2.81 2.807L524.842 4053.7zm-4.386-4.38L3964.51 599.649l2.45 2.456L520.105 4048.96zm-4.561-4.56L3959.95 595.088l2.45 2.456L515.544 4044.4zm-4.561-4.57L3955.38 590.527l2.28 2.28L510.807 4039.66zm-4.386-4.38L3951 586.141l2.1 2.105L506.246 4035.1zm-5.263-5.26L3945.74 580.878l1.93 1.93L500.808 4029.67zm-5.087-5.09L3940.65 575.791l1.75 1.754L495.545 4024.4zm-5.088-5.09L3935.56 570.7l1.58 1.579L490.282 4019.14zm-5.087-5.09L3930.47 565.616l1.41 1.4L485.019 4013.88zm-5.263-5.26L3925.21 560.353l1.05 1.053L479.406 4008.26zm-4.912-4.91L3920.3 555.441l.88.877L474.318 4003.18zm-5.263-5.26L3915.04 550.178l.7.7L468.88 3997.74zm-5.087-5.09L3909.95 545.091l.52.526L463.617 3992.47zm-5.091-5.09L3904.86 540l.35.351L458.354 3987.21z" />
                        <path className="svg-polygons-bio-1 svg-polygons-dark" d="M-193.47 4021.47l-90.287-90.29L1517.01 2130.41A207.193 207.193 0 0 0 1569 2137c114.32 0 207-92.68 207-207a207.193 207.193 0 0 0-6.59-51.99L3893.44-246.026l90.29 90.289z" />
                        <path className="svg-polygons-bio-1 svg-polygons-dark" d="M1673.75 1751.44a207.116 207.116 0 0 0-220.18 6.71L3525.01-313.3l106.74 106.735zM1362 1930a206 206 0 0 0 28.44 104.75L-462.295 3887.49l-106.734-106.73L1397.15 1814.57A206.074 206.074 0 0 0 1362 1930z" />
                        <path className="svg-polygons-bio-7 svg-polygons-dark" d="M1587.72 2125.11l177.48-177.47c-8.42 93.84-83.29 168.64-177.48 177.47zm-35.02.22q-9.645-.795-19.01-2.47l228.96-228.97q1.74 9.3 2.59 18.9zm-24.6-3.57q-8.175-1.725-16.09-4.1l245.32-245.32q2.43 7.86 4.19 15.99zm-22.16-6.02q-6.975-2.34-13.71-5.18l257.85-257.85q2.88 6.69 5.28 13.62zm-20.13-8.04q-5.955-2.76-11.7-5.9l267.07-267.07q3.195 5.685 6.01 11.6zm-18.41-9.75q-5.07-3.045-9.93-6.38l273.35-273.36q3.375 4.83 6.47 9.85zm-16.84-11.33q-4.29-3.21-8.38-6.65l276.91-276.91q3.48 4.065 6.72 8.31zm-29.32-27.01q-2.94-3.3-5.71-6.74l276.19-276.19q3.465 2.745 6.8 5.65zm-12.53-15.64q-2.34-3.255-4.54-6.62l271.89-271.89q3.39 2.175 6.67 4.49zm-11.02-17.14q-1.815-3.165-3.49-6.39l264.82-264.82c2.17 1.11 4.3 2.26 6.42 3.45zm-9.42-18.75c-.88-2-1.73-4.01-2.54-6.05l254.73-254.73c2.05.8 4.08 1.62 6.1 2.48zm-7.64-20.54q-.855-2.8-1.64-5.65l241.2-241.19c1.9.51 3.8 1.04 5.68 1.61zm-5.51-22.65c-.31-1.7-.6-3.42-.86-5.14l223.64-223.64q2.6.375 5.18.82zm-2.88-25.29c-.08-1.51-.14-3.02-.18-4.54l201.02-201.01q2.28.045 4.56.15zm.71-28.88q.195-1.92.42-3.84l171.4-171.4c1.29-.16 2.57-.31 3.87-.44zm86.38-143.56c.81-.54 1.63-1.07 2.45-1.6l-58.64 58.63c.55-.84 1.1-1.66 1.66-2.49zm-79.72 108.74c.29-1.02.6-2.03.91-3.04l130.1-130.11c1-.31 2.02-.6 3.03-.89zm55.58 197.93q-3.585-3.3-6.98-6.76l277.84-277.85q3.5 3.375 6.83 6.92zM1569 2126c-3.78 0-7.53-.12-11.25-.33l207.86-207.86c.25 4.04.39 8.1.39 12.19 0 4.43-.16 8.82-.45 13.18l-182.31 182.31c-4.71.33-9.45.51-14.24.51z" />
                      </svg>
                    </div>
                    <div className="ut-bio-details_group">
                      <div className="ut-bio-details_headings">
                        <h2 className="ut-bio-details_header--player-name">{playerName}</h2>
                        <h3 className="ut-bio-details_header--item-type">
                          Watch live trades over the next 20 minutes to determine the quality
                          of the player for use in the Auto Buyer.  The more active trades the
                          better the player.  The bigger the pricing disparity, the more chance
                          you have of winning trades.
                        </h3>
                      </div>
                      <div className="ut-bio-prices">
                        <div className="ut-bio-prices_info">
                          <div className="ut-bio-prices_tooltip-label">Price</div>
                        </div>
                        <div className="ut-dropdown_label">
                          <span className="ut-dropdown_label-value ng-binding">
                            <PlatformIcon platform={this.props.platform} />
                          </span>
                        </div>
                        <div className="ut-bio-prices_range">
                          <div className="ut-bio-prices_price">
                            <span className="ut-data_val ut-data_val--coins ut-bio-prices_price-value ng-binding">
                              {player.price && numeral(player.price.lowest).format('0,0')}
                            </span>
                            <div className="ut-bio-prices_price-label">Lowest BIN</div>
                          </div>
                          <div className="ut-bio-prices_price">
                            <span className="ut-data_val ut-data_val--coins ut-bio-prices_price-value ng-binding">
                              {player.price && numeral(player.price.buy).format('0,0')}
                            </span>
                            <div className="ut-bio-prices_price-label">Buy For</div>
                          </div>
                          <div className="ut-bio-prices_price">
                            <span className="ut-data_val ut-data_val--coins ut-bio-prices_price-value ng-binding">
                              {player.price && numeral(player.price.sell).format('0,0')}
                            </span>
                            <div className="ut-bio-prices_price-label">Sell For</div>
                          </div>
                          <div className="ut-bio-prices_price">
                            <span className="ut-data_val ut-data_val--coins ut-bio-prices_price-value ng-binding">
                              {player.price && numeral(player.price.bin).format('0,0')}
                            </span>
                            <div className="ut-bio-prices_price-label">Set BIN</div>
                          </div>
                        </div>
                      </div>
                      <div className="ut-bio-details_stats ut-grid-view">
                        <div className="ut-grid-view_item">
                          <table className="ut-bio-stats_data">
                            <tbody>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">watched</th>
                                <td className="ut-bio-stats_data-value">{watched.length || 'N/A'}</td>
                              </tr>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">remaining</th>
                                <td className="ut-bio-stats_data-value">{watched.length ? remaining.length : 'N/A'}</td>
                              </tr>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">active bids</th>
                                <td className="ut-bio-stats_data-value">{active.length || 'N/A'}</td>
                              </tr>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">lowest unsold</th>
                                <td className="ut-bio-stats_data-value">{unsoldPrice.length ? numeral(ss.min(unsoldPrice)).format('0,0') : 'N/A'}</td>
                              </tr>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">median sold</th>
                                <td className="ut-bio-stats_data-value">{soldPrice.length ? numeral(ss.median(soldPrice)).format('0,0') : 'N/A'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="ut-grid-view_item clear">
                          <table className="ut-bio-stats_data">
                            <tbody>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">bid %</th>
                                <td className="ut-bio-stats_data-value">{expired.length ? `${Math.round((sold.length / expired.length) * 100)}%` : 'N/A'}</td>
                              </tr>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">expired</th>
                                <td className="ut-bio-stats_data-value">{watched.length ? expired.length : 'N/A'}</td>
                              </tr>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">total bids</th>
                                <td className="ut-bio-stats_data-value">{active.length + sold.length || 'N/A'}</td>
                              </tr>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">lowest sold</th>
                                <td className="ut-bio-stats_data-value">{soldPrice.length ? numeral(ss.min(soldPrice)).format('0,0') : 'N/A'}</td>
                              </tr>
                              <tr className="ut-bio-stats_data-row">
                                <th className="ut-bio-stats_data-type">average sold</th>
                                <td className="ut-bio-stats_data-value">{soldPrice.length ? numeral(ss.mean(soldPrice)).format('0,0') : 'N/A'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PlayerWatch.propTypes = {
  start: PropTypes.func.isRequired,
  stop: PropTypes.func.isRequired,
  params: PropTypes.shape({
    id: PropTypes.int
  }),
  player: PropTypes.shape({
    list: PropTypes.shape({})
  }),
  watch: PropTypes.shape({
    trades: PropTypes.shape({})
  }),
  platform: PropTypes.string,
};

PlayerWatch.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    player: state.player,
    watch: state.watch,
    platform: state.account.platform
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(WatchActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerWatch);
