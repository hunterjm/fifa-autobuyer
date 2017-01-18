import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { shell } from 'electron';

class Header extends Component {
  handleClickPlayerLink() {
    const base = 'https://www.easports.com/fifa/ultimate-team/fut/database/player/';
    shell.openExternal(`${base}${this.props.player.baseId}/${this.props.player.name}#${this.props.player.id}`);
  }

  render() {
    const player = this.props.player;
    const tabBioClasses = classNames({
      'details-tab': true,
      active: !this.props.router.isActive(`/players/${player.id}/history`),
    });
    const tabSettingsClasses = classNames({
      'details-tab': true,
      active: this.props.router.isActive(`/players/${player.id}/history`),
    });
    return (
      <div>
        <div className="header-section">
          <div className="text">
            {player.firstName} {player.lastName}
          </div>
        </div>
        <div className="details-subheader">
          <div className="details-header-actions">
            {
              this.props.updatePrice
              ?
              (
                <div className="action" onClick={() => this.props.updatePrice(true)}>
                  <div className="action-icon">
                    <span className="icon icon-restart" />
                  </div>
                  <div className="btn-label">UPDATE</div>
                </div>
              )
              :
              null
            }
            <div className="action" onClick={this.handleClickPlayerLink.bind(this)}>
              <div className="action-icon">
                <span className="icon icon-open-external" />
              </div>
              <div className="btn-label">EA BIO</div>
            </div>
          </div>
          <div className="details-subheader-tabs">
            <span className={tabBioClasses}><Link to={`/players/${player.id}`}>Bio</Link></span>
            <span className={tabSettingsClasses}><Link to={`/players/${player.id}/history`}>History</Link></span>
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.int,
    baseId: PropTypes.int,
    name: PropTypes.string
  }),
  updatePrice: PropTypes.func,
  router: PropTypes.shape({
    isActive: PropTypes.func
  }),
};

export default Header;
