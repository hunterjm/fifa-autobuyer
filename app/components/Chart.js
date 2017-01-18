import React, { PropTypes, Component } from 'react';
import Highcharts from 'highcharts/highstock';

class Chart extends Component {
  constructor(props) {
    super(props);
    this.chart = undefined;
  }

  // When the DOM is ready, create the chart.
  componentDidMount() {
    // Extend Highcharts with modules
    if (this.props.modules) {
      this.props.modules.forEach(module => {
        module(Highcharts);
      });
    }
    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      },
      global: {
        useUTC: false
      }
    });
    this.chart = new Highcharts[this.props.type || 'Chart'](
      this.props.container,
      this.props.options
    );
  }

  componentDidUpdate() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Highcharts[this.props.type || 'Chart'](
      this.props.container,
      this.props.options
    );
  }

  // Destroy chart before unmount.
  componentWillUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // Create the div which the chart will be rendered to.
  render() {
    return (<div id={this.props.container} />);
  }
}

Chart.propTypes = {
  container: PropTypes.string,
  type: PropTypes.string,
  options: PropTypes.shape({}),
  modules: PropTypes.arrayOf(PropTypes.func),
};

export default Chart;
