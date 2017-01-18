import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import Header from './Header';
import PlayerDetailTable from './PlayerDetailTable';
import * as PlayerActions from '../../actions/player';

export class PlayerDetails extends Component {
  constructor(props) {
    super(props);
    this.player = props.player.list[props.params.id];
  }

  componentDidMount() {
    this.updatePrice();
  }

  shouldComponentUpdate(nextProps) {
    const id = this.props.params.id;
    const nextId = nextProps.params.id;
    const price = JSON.stringify(_.get(this.props.player, `list[${this.props.params.id}].price`, {}));
    const nextPrice = JSON.stringify(_.get(nextProps.player, `list[${this.props.params.id}].price`, {}));

    if (nextId === id && nextPrice === price) {
      return false;
    }
    return true;
  }

  componentWillUpdate(nextProps) {
    this.player = nextProps.player.list[nextProps.params.id];
    this.updatePrice();
  }

  updatePrice(force = false) {
    const price = this.player.price || {};
    const lastUpdated = moment(price.updated || 0);
    if (force || !price.buy || moment().isAfter(lastUpdated.add(1, 'h'))) {
      this.props.findPrice(this.player.id);
    }
  }

  render() {
    return (
      <div className="details">
        <Header
          player={this.player}
          updatePrice={this.updatePrice.bind(this)}
          router={this.context.router}
        />
        <div className="details-panel home">
          <div className="content">
            <div className="full">
              <PlayerDetailTable player={this.player} platform={this.props.platform} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

PlayerDetails.propTypes = {
  findPrice: PropTypes.func.isRequired,
  params: PropTypes.shape({
    id: PropTypes.int
  }),
  player: PropTypes.shape({
    list: PropTypes.shape({})
  }),
  platform: PropTypes.string,
};

PlayerDetails.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    player: state.player,
    platform: state.account.platform
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(PlayerActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerDetails);
