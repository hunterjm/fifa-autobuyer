import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ss from 'simple-statistics';
import classNames from 'classnames';
import moment from 'moment';
import Header from './Header';
import Chart from '../Chart';
import { getMarketData } from '../../actions/bid';

export class PlayerHistory extends Component {
  constructor(props) {
    super(props);
    this.player = props.player.list[props.params.id];
  }

  componentDidMount() {
    // Load Market Data
    this.props.getMarketData(this.props.platform, 'daily_graph', this.player.id);
  }

  shouldComponentUpdate(nextProps) {
    // Only update if our data changed
    const oldData = this.props.market.data;
    const newData = nextProps.market.data;
    if (
      newData.length !== oldData.length
      || (
        newData.length && oldData.length
        && (
          newData[newData.length - 1][0] !== oldData[oldData.length - 1][0]
          || newData[newData.length - 1][1] !== oldData[oldData.length - 1][1]
        )
      )
    ) {
      return true;
    }

    return this.props.params.id !== nextProps.params.id;
  }

  componentWillUpdate(nextProps) {
    this.player = nextProps.player.list[nextProps.params.id];
    if (this.props.params.id !== nextProps.params.id) {
      this.props.getMarketData(this.props.platform, 'daily_graph', this.player.id);
    }
  }

  render() {
    const history = Object.values(this.player.history);

    // Stats
    const bought = history.filter(trade => trade.bought > 0);
    const sold = history.filter(trade => trade.sold > 0);
    const both = history.filter(trade => trade.bought > 0 && trade.sold > 0);
    const purchasePrices = bought.map(trade => trade.bought);
    const soldPrices = sold.map(trade => trade.sold);
    const soldTime = both.map(trade => Math.round((trade.soldAt - trade.boughtAt) / 1000 / 60));
    const profits = both.map(trade => (trade.sold * 0.95) - trade.bought);
    const meanBought = ss.mean(purchasePrices) || 'N/A';
    const medianBought = ss.median(purchasePrices) || 'N/A';
    const meanSold = ss.mean(soldPrices) || 'N/A';
    const medianSold = ss.median(soldPrices) || 'N/A';
    const meanSoldTime = ss.mean(soldTime) || 'N/A';
    const meanProfit = ss.mean(profits) || 'N/A';

    const tabDailyClasses = classNames({
      active: this.props.market.data.length && moment(this.props.market.data[0][0]).utc().isBefore(moment.utc().subtract(2, 'days'), 'day')
    });
    const tabTodayClasses = classNames({
      active: this.props.market.data.length && moment(this.props.market.data[0][0]).utc().isSame(moment.utc(), 'day')
    });
    const tabYesterdayClasses = classNames({
      active: this.props.market.data.length && moment(this.props.market.data[0][0]).utc().isSame(moment.utc().subtract(1, 'days'), 'day')
    });
    const tabDayBeforeLastClasses = classNames({
      active: this.props.market.data.length && moment(this.props.market.data[0][0]).utc().isSame(moment.utc().subtract(2, 'days'), 'day')
    });
    let dailyChartOptions;
    if (this.props.market.data.length) {
      const marketData = this.props.market.data;

      // Configure Market Trends Chart
      const seriesData = [{
        type: 'area',
        name: 'futbin.com',
        data: marketData,
        color: ['xone', 'x360'].indexOf(this.props.platform) !== -1 ? '#55cca2' : '#3498db',
        showInLegend: true,
        tooltip: {
          valueDecimals: 0
        },
        visible: true
      }];
      if (this.props.market.flags.length) {
        seriesData.push({
          type: 'flags',
          name: 'Events',
          data: this.props.market.flags,
          shape: 'flag',
          width: 45
        });
      }
      dailyChartOptions = {
        rangeSelector: {
          enabled: true,
          selected: 0,
          inputEnabled: true,
          buttons: [{
            type: 'month',
            count: 1,
            text: '1m'
          }, {
            type: 'month',
            count: 3,
            text: '3m'
          }, {
            type: 'month',
            count: 6,
            text: '6m'
          }, {
            type: 'ytd',
            text: 'YTD'
          }, {
            type: 'year',
            count: 1,
            text: '1y'
          }, {
            type: 'all',
            text: 'All'
          }]
        },
        legend: {
          enabled: true
        },
        navigator: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            month: '%e. %b',
            year: '%b'
          }
        },
        yAxis: {
          title: {
            text: 'Average Price'
          },
          min: 0,
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        tooltip: {
          useHTML: true,
          valueSuffix: '<span style="position: relative; top: -2px;"> <img src="https://www.futbin.com/design/img/coins.png"></span>'
        },
        plotOptions: {
          spline: {
            marker: {
              enabled: true
            }
          }
        },
        series: seriesData
      };
    }

    return (
      <div className="details">
        <Header
          player={this.player}
          router={this.context.router}
        />
        <div className="details-panel home">
          <div className="content">
            <div className="left">
              <div className="wrapper">
                <div className="widget">
                  <div className="top-bar">
                    <div className="text">
                      Market Trends
                    </div>
                    <div className="menu">
                      <ul>
                        <a className={tabDailyClasses}>
                          <li onClick={() => this.props.getMarketData(this.props.platform, 'daily_graph', this.player.id)}>
                            Daily
                          </li>
                        </a>
                        <a className={tabTodayClasses}>
                          <li onClick={() => this.props.getMarketData(this.props.platform, 'today', this.player.id)}>
                            Today
                          </li>
                        </a>
                        <a className={tabYesterdayClasses}>
                          <li onClick={() => this.props.getMarketData(this.props.platform, 'yesterday', this.player.id)}>
                            Yesterday
                          </li>
                        </a>
                        <a className={tabDayBeforeLastClasses}>
                          <li onClick={() => this.props.getMarketData(this.props.platform, 'da_yesterday', this.player.id)}>
                            {moment.utc().subtract(2, 'days').format('dddd')}
                          </li>
                        </a>
                      </ul>
                    </div>
                  </div>
                  {
                    dailyChartOptions
                    ? <Chart type="StockChart" container="daily_graph" options={dailyChartOptions} />
                    : null
                  }
                </div>
              </div>
            </div>
            <div className="right">
              <div className="wrapper">
                <div className="widget">
                  <div className="top-bar">
                    <div className="text">Autobuyer Stats</div>
                  </div>
                  <table className="table">
                    <tbody>
                      <tr>
                        <td>Completed Trades</td>
                        <td>{both.length}</td>
                      </tr>
                      <tr>
                        <td>Average Profit per Trade</td>
                        <td>{meanProfit}</td>
                      </tr>
                      <tr>
                        <td>Average Purchace Price</td>
                        <td>{meanBought}</td>
                      </tr>
                      <tr>
                        <td>Median Purchace Price</td>
                        <td>{medianBought}</td>
                      </tr>
                      <tr>
                        <td>Average Sold Price</td>
                        <td>{meanSold}</td>
                      </tr>
                      <tr>
                        <td>Median Sold Price</td>
                        <td>{medianSold}</td>
                      </tr>
                      <tr>
                        <td>Average Minutes to Sale</td>
                        <td>{meanSoldTime}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PlayerHistory.propTypes = {
  getMarketData: PropTypes.func.isRequired,
  platform: PropTypes.string,
  params: PropTypes.shape({
    id: PropTypes.int
  }),
  player: PropTypes.shape({
    list: PropTypes.shape({})
  }),
  market: PropTypes.shape({
    // title: PropTypes.string,
    data: PropTypes.array,
    flags: PropTypes.array,
  }),
};

PlayerHistory.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    player: state.player,
    platform: state.account.platform,
    market: state.bid.market,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getMarketData }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerHistory);
