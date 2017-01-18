import React, { Component, PropTypes } from 'react';
import validator from 'validator';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as SettingsActions from '../actions/settings';

export class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      errors: {}
    };
  }

  componentDidMount() {
    this.rpmInput.focus();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ errors: nextProps.errors || {} });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextState.loading !== this.state.loading
      || (nextState.errors && nextState.errors !== this.state.errors));
  }

  validate() {
    const errors = {};
    if (!validator.isNumeric(this.props.settings.rpm)) {
      errors.rpm = 'Must be numeric';
    }

    if (!validator.isNumeric(this.props.settings.minCredits)) {
      errors.minCredits = 'Must be numeric';
    }

    if (!validator.isNumeric(this.props.settings.maxCard)) {
      errors.maxCard = 'Must be numeric';
    }

    if (!validator.isNumeric(this.props.settings.buy)) {
      errors.buy = 'Must be numeric';
    }

    if (!validator.isNumeric(this.props.settings.sell)) {
      errors.sell = 'Must be numeric';
    }

    if (!validator.isNumeric(this.props.settings.bin)) {
      errors.bin = 'Must be numeric';
    }

    return errors;
  }

  handleChange(event) {
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    }
    this.props.setSetting(event.target.name, value);
  }

  handleBlur(event) {
    this.setState({ errors: _.omitBy(
      this.validate(),
      (val, key) => key !== event.target.name && !_.get(this.props.settings, `[${key}].length`, 0)
    ) });
  }

  render() {
    const {
      rpm, minCredits, maxCard, snipeOnly, autoUpdate, buy, sell, bin, relistAll
     } = this.props.settings;
    return (
      <div className="preferences">
        <div className="preferences-content">
          <div className="title">Global Settings</div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="rpm">RPM</label>
              <p><small>Requests Per Minute</small></p>
            </div>
            <div className="option-value">
              <input
                ref={rpmInput => (this.rpmInput = rpmInput)} maxLength="3" name="rpm" placeholder="RPM"
                value={rpm || ''} type="text" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
              />
              <p className="error-message">{this.state.errors.rpm}</p>
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="minCredits">Min Credits</label>
              <p><small>Will attempt to not go under this value</small></p>
            </div>
            <div className="option-value">
              <input
                ref={minCreditsInput => (this.minCreditsInput = minCreditsInput)} name="minCredits" placeholder="Min Credits"
                value={minCredits || ''} type="text" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
              />
              <p className="error-message">{this.state.errors.minCredits}</p>
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="maxCard">Max Cards</label>
              <p><small>Maximum number of individual player cards in transfer list</small></p>
            </div>
            <div className="option-value">
              <input
                ref={maxCardInput => (this.maxCardInput = maxCardInput)} maxLength="3" name="maxCard" placeholder="Max Cards"
                value={maxCard || ''} type="text" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
              />
              <p className="error-message">{this.state.errors.maxCard}</p>
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="snipeOnly">BIN Snipe Only</label>
              <p><small>Only purchase players for buy it now price, no bidding</small></p>
            </div>
            <div className="option-value">
              <input
                ref={snipeOnlyInput => (this.snipeOnlyInput = snipeOnlyInput)} name="snipeOnly"
                checked={snipeOnly} type="checkbox" onChange={this.handleChange.bind(this)}
              />
            </div>
          </div>
          <div className="title">Price Settings</div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="autoUpdate">Automatically Update Prices</label>
              <p><small>Updates every hour based on lowest listed BIN price</small></p>
            </div>
            <div className="option-value">
              <input
                ref={autoUpdateInput => (this.autoUpdateInput = autoUpdateInput)} name="autoUpdate"
                checked={autoUpdate} type="checkbox" onChange={this.handleChange.bind(this)}
              />
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="buy">Purchase Price</label>
              <p><small>Percentage of lowest listed price you want to buy the player at</small></p>
            </div>
            <div className="option-value">
              <input
                ref={buyInput => (this.buyInput = buyInput)} maxLength="3" name="buy" placeholder="Buy"
                value={buy} type="text" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
              />%
              <p className="error-message">{this.state.errors.buy}</p>
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="sell">List Price</label>
              <p><small>Percentage of lowest listed price you want to list the player at</small></p>
            </div>
            <div className="option-value">
              <input
                ref={sellInput => (this.sellInput = sellInput)} maxLength="3" name="sell" placeholder="Sell"
                value={sell} type="text" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
              />%
              <p className="error-message">{this.state.errors.sell}</p>
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="bin">Listed BIN Price</label>
              <p><small>Percentage of lowest listed price you want to set listed BIN at</small></p>
            </div>
            <div className="option-value">
              <input
                ref={binInput => (this.binInput = binInput)} maxLength="3" name="bin" placeholder="BIN"
                value={bin} type="text" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
              />%
              <p className="error-message">{this.state.errors.bin}</p>
            </div>
          </div>
          <div className="option">
            <div className="option-name">
              <label htmlFor="relistAll">Same Relist Price</label>
              <p><small>
                Relist players at the prices they were bought for if market price changes
                <br />
                (risks tying up capital that could otherwise be used to make up the difference)
              </small></p>
            </div>
            <div className="option-value">
              <input
                ref={relistAllInput => (this.relistAllInput = relistAllInput)} name="relistAll"
                checked={relistAll} type="checkbox" onChange={this.handleChange.bind(this)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  setSetting: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    rpm: PropTypes.string,
    minCredits: PropTypes.string,
    maxCard: PropTypes.string,
    snipeOnly: PropTypes.bool,
    autoUpdate: PropTypes.bool,
    buy: PropTypes.string,
    sell: PropTypes.string,
    bin: PropTypes.string,
    relistAll: PropTypes.bool
  })
};

Settings.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object
};

function mapStateToProps(state) {
  return {
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
