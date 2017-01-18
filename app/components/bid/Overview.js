import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ss from 'simple-statistics';
import numeral from 'numeral';
import { shell } from 'electron';
import Header from './Header';
import ConnectedTransfers from './Transfers';
import Chart from '../Chart';
import * as BidActions from '../../actions/bid';

export class Overview extends Component {
  componentDidMount() {
    // Load Market Data
    this.props.getMarketData(this.props.platform);
  }

  shouldComponentUpdate(nextProps) {
    // Only update if our data changed
    const oldData = this.props.bid.market.data;
    const newData = nextProps.bid.market.data;
    if (
      newData.length !== oldData.length
      || (
        newData.length && oldData.length
        && newData[newData.length - 1][0] !== oldData[oldData.length - 1][0]
      )
    ) {
      return true;
    }
    return this.props.bidding !== nextProps.bidding;
  }

  render() {
    let liveChartOptions;
    if (this.props.bid.market.data.length) {
      const marketData = this.props.bid.market.data;

      // Determine market momentum
      const points = marketData.slice(-240);
      const regression = ss.linearRegression(points.map((p, i) => [i, p[1]]));
      const l = ss.linearRegressionLine(regression);
      const regressionLine = points.map((p, i) => [p[0], l(i)]);
      const change = ((
        (regressionLine[regressionLine.length - 1][1] - regressionLine[0][1]) / regressionLine[0][1]
      ) * 100);

      // Configure Market Trends Chart
      const seriesData = [{
        type: 'area',
        name: 'Market Index',
        data: marketData,
        color: ['xone', 'x360'].indexOf(this.props.platform) !== -1 ? '#55cca2' : '#3498db',
        showInLegend: false,
        tooltip: {
          valueDecimals: 2
        },
        visible: true
      }, {
        type: 'line',
        name: 'Market Regression',
        data: regressionLine,
        color: ['xone', 'x360'].indexOf(this.props.platform) !== -1 ? '#3498db' : '#55cca2',
        showInLegend: false,
        tooltip: {
          valueDecimals: 2
        },
        visible: true
      }];
      if (this.props.bid.market.flags.length) {
        seriesData.push({
          type: 'flags',
          name: 'Events',
          data: this.props.bid.market.flags,
          shape: 'flag',
          width: 45
        });
      }
      liveChartOptions = {
        rangeSelector: {
          enabled: false
        },
        title: {
          text: this.props.bid.market.title
        },
        subtitle: {
          text: `4 Hour Change: ${change.toFixed(2)}% - Standard Deviation: ${Math.round(ss.standardDeviation(marketData.map(p => p[1])) * 100) / 100}`
        },
        legend: {
          enabled: true
        },
        navigator: {
          enabled: true
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
            text: 'Index Value'
          },
          opposite: false,
          min: marketData.reduce((a, b) => Math.min(a, b[1]), 1000) - 15,
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
          line: {
            marker: {
              enabled: true,
              radius: 1
            }
          },
          spline: {
            marker: {
              enabled: true
            }
          }
        },
        series: seriesData
      };
    }

    const lifetimeTrades = Object.values(this.props.player.list)
      .reduce((p, c) => p.concat(Object.values(c.history)), [])
      .filter(trade => trade.bought > 0 && trade.sold > 0);
    const lifetimeProfit = lifetimeTrades
      .reduce((p, c) => p + (c.sold - c.bought), 0);

    return (
      <div className="details">
        <Header
          start={this.props.start}
          stop={this.props.stop}
          bidding={this.props.bidding}
          router={this.context.router}
        />
        <div className="details-panel home">
          <div className="content">
            <div className="left">
              <ConnectedTransfers />
            </div>
            <div className="right">
              <div className="wrapper">
                <div className="widget">
                  <div className="top-bar">
                    <div className="text">Lifetime Profit</div>
                  </div>
                  <div style={{ padding: '1em' }}>
                    <div className="lifetimeStats" style={{ fontSize: '2em', textAlign: 'center' }}>
                      {numeral(lifetimeProfit).format('0,0')} credits - {numeral(lifetimeTrades.length).format('0,0')} trades
                    </div>
                  </div>
                </div>
                <div className="widget">
                  <div className="top-bar">
                    <div className="text">Market Trends</div>
                    <div className="action" onClick={() => this.props.getMarketData(this.props.platform)}>
                      <span className="icon icon-restart" />
                    </div>
                    <div className="action" onClick={() => shell.openExternal('https://www.futbin.com/market/')}>
                      <span className="icon icon-open-external" />
                    </div>
                  </div>
                  {
                    liveChartOptions
                    ? <Chart type="StockChart" container="live_graph" options={liveChartOptions} />
                    : null
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Overview.propTypes = {
  player: PropTypes.shape({
    list: PropTypes.shape({})
  }),
  bid: PropTypes.shape({
    market: PropTypes.shape({
      data: PropTypes.array,
      flags: PropTypes.array,
      title: PropTypes.string,
    })
  }),
  bidding: PropTypes.bool,
  platform: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  start: PropTypes.func.isRequired,
  stop: PropTypes.func.isRequired,
  getMarketData: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

Overview.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    player: state.player,
    bid: state.bid,
    bidding: state.bid.bidding,
    platform: state.account.platform,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BidActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Overview);
