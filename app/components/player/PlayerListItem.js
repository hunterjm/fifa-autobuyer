import $ from 'jquery';
import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import { remote } from 'electron';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ss from 'simple-statistics';
import numeral from 'numeral';
import * as PlayerActions from '../../actions/player';

export class PlayerListItem extends Component {
  handleItemMouseEnter() {
    $(this.node).find('.action').show();
  }

  handleItemMouseLeave() {
    $(this.node).find('.action').hide();
  }

  handleClick() {
    let link = `/players/${this.props.player.id}`;
    if (this.context.router.isActive(`/players/${this.context.router.params.id}/history`)) {
      link = `/players/${this.props.player.id}/history`;
    }
    this.context.router.push(link);
  }

  handleDeletePlayer(e) {
    e.preventDefault();
    e.stopPropagation();
    remote.dialog.showMessageBox({
      message: `Are you sure you want to remove ${this.props.player.name}?`,
      buttons: ['Remove', 'Cancel']
    }, index => {
      if (index === 0) {
        this.deletePlayer();
      }
    });
  }

  deletePlayer() {
    if (this.context.router.isActive(`/players/${this.props.player.id}`)) {
      this.context.router.push('/players');
    }
    this.props.remove(this.props.player);
  }

  render() {
    const player = this.props.player;
    const className = `ut-item_affiliation--list-view ut-item--list-view-bg-${player.color}`;
    const card = (
      <OverlayTrigger placement="bottom" overlay={<Tooltip id="TOTY">TOTY</Tooltip>}>
        <div className={className}>
          <img role="presentation" src={_.get(player, 'club.imageUrls.normal.small')} />
          <img role="presentation" src={_.get(player, 'nation.imageUrls.small')} />
        </div>
      </OverlayTrigger>
    );

    const history = Object.values(this.props.history);
    const both = history.filter(trade => trade.bought > 0 && trade.sold > 0);
    const profits = both.map(trade => (trade.sold * 0.95) - trade.bought);
    const totalProfit = ss.sum(profits) || 'N/A';

    return (
      <div ref={node => (this.node = node)}>
        <li
          onMouseEnter={this.handleItemMouseEnter.bind(this)}
          onMouseLeave={this.handleItemMouseLeave.bind(this)}
          onClick={() => this.handleClick()}
          id={player.id}
        >
          {card}
          <div className="info">
            <div className="name">
              {player.name}
            </div>
            <div className="image">
              profit: {numeral(totalProfit).format('0,0')}
              <br />
              {numeral(_.get(player, 'price.buy')).format('0,0')}/
              {numeral(_.get(player, 'price.sell')).format('0,0')}/
              {numeral(_.get(player, 'price.bin')).format('0,0')}
            </div>
          </div>
          <div className="action">
            <span className="btn circular" onClick={this.handleDeletePlayer.bind(this)}>
              <span className="icon icon-delete" />
            </span>
          </div>
        </li>
      </div>
    );
  }
}

PlayerListItem.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.int,
    name: PropTypes.string
  }),
  history: PropTypes.shape({}),
  remove: PropTypes.func.isRequired,
};

PlayerListItem.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(PlayerActions, dispatch);
}

export default connect(() => ({}), mapDispatchToProps)(PlayerListItem);
