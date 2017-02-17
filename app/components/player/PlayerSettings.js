import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Fut from 'fut-promise';
import validator from 'validator';
import Header from './Header';

import * as PlayerActions from '../../actions/player';

export class PlayerSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      errors: {}
    };
    this.player = props.player.list[props.params.id];
  }

  componentDidMount() {
    this.maxCardInput.focus();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ errors: nextProps.errors || {} });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextState.loading !== this.state.loading
      || (nextState.errors && nextState.errors !== this.state.errors));
  }

  componentWillUpdate(nextProps) {
    this.player = nextProps.player.list[nextProps.params.id];
  }

  validate() {
    const errors = {};
    const price = _.get(this.player, 'price', {});

    if (!Fut.isPriceValid(price.buy)) {
      errors.buy = 'Must be a valid price';
    }

    if (!Fut.isPriceValid(price.sell)) {
      errors.sell = 'Must be a valid price';
    }

    if (!Fut.isPriceValid(price.bin)) {
      errors.bin = 'Must be a valid price';
    }

    if (!validator.isNumeric(this.player.settings.bidUntilMin)) {
      errors.binUntilMin = 'Must be a numeric';
    }
    return errors;
  }

  handleChange(event) {
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    }
    this.props.setSetting(this.player.id, event.target.name, value);
  }

  handlePriceChange(event) {
    const price = _.merge({}, this.player.price);
    price[event.target.name] = event.target.value;
    this.props.setPrice(this.player.id, price);
  }

  handlePriceBlur(event) {
    this.setState({ errors: _.omitBy(
      this.validate(),
      (val, key) => (
        key !== event.target.name
        && (
          !_.get(this.player, `settings[${key}].length`, 0)
          || !_.get(this.player, `price[${key}].length`, 0)
        )
      )
    ) });
  }

  handleBlur(event) {
    this.setState({ errors: _.omitBy(
      this.validate(),
      (val, key) => key !== event.target.name && !_.get(this.player.settings, `[${key}].length`, 0)
    ) });
  }

  render() {
    const { maxCard, snipeOnly, bidUntilMin, autoUpdate, relistAll } = _.get(this.player, 'settings', {});
    const { buy, sell, bin } = _.get(this.player, 'price', {});
    const defaultSettings = _.get(this.props, 'settings', {});
    return (
      <div className="details">
        <Header
          player={this.player}
          router={this.context.router}
        />
        <div className="details-panel">
          <div className="settings">
            <div className="settings-panel preferences">
              <div className="settings-section preferences-content">
                <div className="title" style={{ marginTop: 0 }}>Player Settings</div>
                <div className="global">
                  <div className="option">
                    <div className="option-name">
                      <label htmlFor="maxCard">Max Cards</label>
                      <p><small>Maximum number of this player allowed in transfer list</small></p>
                    </div>
                    <div className="option-value">
                      <input
                        ref={maxCardInput => (this.maxCardInput = maxCardInput)} maxLength="3" name="maxCard"
                        placeholder={defaultSettings.maxCard} value={maxCard || ''} type="text"
                        onChange={this.handleChange.bind(this)}
                      />
                      <p className="error-message">{this.state.errors.maxCard}</p>
                    </div>
                  </div>
                  <div className="option">
                    <div className="option-name">
                      <label htmlFor="snipeOnly">BIN Snipe Only</label>
                      <p><small>
                        Only purchase this player for buy it now price, no bidding
                      </small></p>
                    </div>
                    <div className="option-value">
                      <input
                        ref={snipeOnlyInput => (this.snipeOnlyInput = snipeOnlyInput)} name="snipeOnly"
                        checked={snipeOnly !== undefined ? snipeOnly : defaultSettings.snipeOnly}
                        type="checkbox" onChange={this.handleChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="option">
                    <div className="option-name">
                      <label htmlFor="bidUntilMin">Bid Until Min.</label>
                      <p>
                        <small>Maximum number of minutes before auction expires that you would like to bid on trades</small>
                      </p>
                    </div>
                    <div className="option-value">
                      <input
                        ref={bidUntilMinInput => (this.bidUntilMinInput = bidUntilMinInput)} name="bidUntilMin"
                        placeholder={defaultSettings.bidUntilMin} value={bidUntilMin || ''} type="text"
                        onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
                      />
                      <p className="error-message">{this.state.errors.bidUntilMin}</p>
                    </div>
                  </div>
                </div>
                <div className="title">Price Settings</div>
                <div className="price">
                  <div className="option">
                    <div className="option-name">
                      <label htmlFor="autoUpdate">Automatically Update Prices</label>
                      <p><small>Updates every hour based on lowest listed BIN price</small></p>
                    </div>
                    <div className="option-value">
                      <input
                        ref={autoUpdateInput => (this.autoUpdateInput = autoUpdateInput)} name="autoUpdate"
                        checked={autoUpdate !== undefined ? autoUpdate : defaultSettings.autoUpdate}
                        type="checkbox" onChange={this.handleChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="option">
                    <div className="option-name">
                      <label htmlFor="buy">Purchase Price</label>
                      <p><small>
                        Price you want to buy the player at
                      </small></p>
                    </div>
                    <div className="option-value">
                      <input
                        ref={buyInput => (this.buyInput = buyInput)} maxLength="10" name="buy" placeholder="Buy"
                        value={buy} type="text" onChange={this.handlePriceChange.bind(this)} onBlur={this.handlePriceBlur.bind(this)}
                      />
                      <p className="error-message">{this.state.errors.buy}</p>
                    </div>
                  </div>
                  <div className="option">
                    <div className="option-name">
                      <label htmlFor="sell">List Price</label>
                      <p><small>
                        Price you want to list the player at
                      </small></p>
                    </div>
                    <div className="option-value">
                      <input
                        ref={sellInput => (this.sellInput = sellInput)} maxLength="10" name="sell" placeholder="Sell"
                        value={sell} type="text" onChange={this.handlePriceChange.bind(this)} onBlur={this.handlePriceBlur.bind(this)}
                      />
                      <p className="error-message">{this.state.errors.sell}</p>
                    </div>
                  </div>
                  <div className="option">
                    <div className="option-name">
                      <label htmlFor="bin">Listed BIN Price</label>
                      <p><small>
                        Price you want to set listed BIN at
                      </small></p>
                    </div>
                    <div className="option-value">
                      <input
                        ref={binInput => (this.binInput = binInput)} maxLength="10" name="bin" placeholder="BIN"
                        value={bin} type="text" onChange={this.handlePriceChange.bind(this)} onBlur={this.handlePriceBlur.bind(this)}
                      />
                      <p className="error-message">{this.state.errors.bin}</p>
                    </div>
                  </div>
                  <div className="option">
                    <div className="option-name">
                      <label htmlFor="relistAll">Same Relist Price</label>
                      <p><small>
                        Relist players at the prices they were bought for if market price changes
                        <br />
                        (risks tying up capital that could otherwise be used
                        to make up the difference)
                      </small></p>
                    </div>
                    <div className="option-value">
                      <input
                        ref={relistAllInput => (this.relistAllInput = relistAllInput)} name="relistAll"
                        checked={relistAll !== undefined ? relistAll : defaultSettings.relistAll}
                        type="checkbox" onChange={this.handleChange.bind(this)}
                      />
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

PlayerSettings.propTypes = {
  setSetting: PropTypes.func.isRequired,
  setPrice: PropTypes.func.isRequired,
  params: PropTypes.shape({
    id: PropTypes.int
  }),
  player: PropTypes.shape({
    list: PropTypes.shape({})
  }),
  settings: PropTypes.shape({}),
  errors: PropTypes.shape({})
};

PlayerSettings.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object
};

function mapStateToProps(state) {
  return {
    player: state.player,
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(PlayerActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerSettings);
