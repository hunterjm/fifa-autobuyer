import React, { PropTypes, Component } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

class Header extends Component {
  render() {
    const overviewClasses = classNames({
      'details-tab': true,
      active: !this.props.router.isActive('/players/logs'),
    });
    const logsClasses = classNames({
      'details-tab': true,
      active: this.props.router.isActive('/players/logs'),
    });
    return (
      <div>
        <div className="header-section">
          <div className="text">
            Bidding Overview
          </div>
        </div>
        <div className="details-subheader">
          <div className="details-header-actions">
            {
              this.props.bidding
              ?
                (
                  <div className="action" onClick={() => this.props.stop()}>
                    <div className="action-icon">
                      <span className="icon icon-stop" />
                    </div>
                    <div className="btn-label">STOP</div>
                  </div>
                )
              :
                (
                  <div className="action" onClick={() => this.props.start()}>
                    <div className="action-icon">
                      <span className="icon icon-start" />
                    </div>
                    <div className="btn-label">START</div>
                  </div>
                )
            }
          </div>
          <div className="details-subheader-tabs">
            <span className={overviewClasses}><Link to="/players/overview">Current</Link></span>
            <span className={logsClasses}><Link to="/players/logs">Logs</Link></span>
            { /* TODO: Add a tab to display all trade history */ }
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  bidding: PropTypes.bool,
  start: PropTypes.func.isRequired,
  stop: PropTypes.func.isRequired,
  router: PropTypes.shape({
    isActive: PropTypes.func
  }),
};

export default Header;
