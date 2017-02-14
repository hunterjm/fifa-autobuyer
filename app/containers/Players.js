import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';
import classNames from 'classnames';
import Joyride from 'react-joyride';
import ConnectedPlayerListItem from '../components/player/PlayerListItem';
import ConnectedHeader from '../components/Header';
import * as PlayerActions from '../actions/player';
import * as BidActions from '../actions/bid';

export class Players extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sidebarOffset: 0
    };
  }

  handleScroll(e) {
    if (e.target.scrollTop > 0 && !this.state.sidebarOffset) {
      this.setState({
        sidebarOffset: e.target.scrollTop
      });
    } else if (e.target.scrollTop === 0 && this.state.sidebarOffset) {
      this.setState({
        sidebarOffset: 0
      });
    }
  }

  handleClickClearList() {
    this.props.clear();
    this.context.router.push('/players');
  }

  handleToggleBidding() {
    if (this.props.bidding) {
      this.props.stop();
    } else {
      this.props.start();
      this.context.router.push('/players/overview');
    }
  }

  render() {
    let sidebarHeaderClass = 'sidebar-header';
    if (this.state.sidebarOffset) {
      sidebarHeaderClass += ' sep';
    }

    const players = _.map(
      _.get(this.props, 'player.list', {}),
      player => <ConnectedPlayerListItem key={player.id} player={player} history={_.get(this.props.history, player.id, {})} /> // eslint-disable-line max-len
    );

    const overviewClasses = classNames({
      state: true,
      'state-stopped': !this.props.bidding,
      'state-running': this.props.bidding,
    });

    const steps = [{
      title: 'Search for Players',
      text: 'Start typing the name of the player you want to bid on.  The results will appear below.  Give it a try now!',
      selector: '.search-bar input',
      position: 'right',
      allowClicksThruHole: true,
      style: {
        beacon: {
          offsetX: 20
        }
      }
    }, {
      title: 'Add to Player List',
      text: 'Clicking on a player card will add it to your player list.  Let\'s do that now.',
      selector: '.new-container .results',
      position: 'bottom',
      allowClicksThruHole: true,
    }, {
      title: 'Settings',
      text: 'Click here so we can adjust our auto buyer settings.',
      selector: '.sidebar-buttons .btn-preferences',
      position: 'top',
      allowClicksThruHole: true,
    }, {
      title: 'Global Settings',
      text: `These settings add restrictions around how the auto buyer operates
             such as the number of requests it is allowed to make in a time frame,
             how many credits it is allowed to spend, and how many of a single player
             it is allowed to buy.<br /><br />The defaults should be good for now, but
             feel free to adjust these before moving on.`,
      selector: '.preferences-content .global',
      position: 'left',
      allowClicksThruHole: true,
    }, {
      title: 'Price Settings',
      text: `These settings control how much we are willing to spend on a player
             relative to their lowest BIN price currently on the transfer market.
             <br /><br />
             <em><strong>PRO TIP</strong>: Cheaper players tend to turn a better profit than expensive
             players.  Think about it, if Messi is going for 1 mil, you probably won't
             find one for 900k, but you can easily get a 1k player for 900.</em>`,
      selector: '.preferences-content .price',
      position: 'left',
      allowClicksThruHole: true,
    }, {
      title: 'View Player Info',
      text: 'Clicking on a player here will pull up their information, including the current market price.  Take a look!',
      selector: '.sidebar-containers .player-list',
      position: 'right',
      allowClicksThruHole: true,
    }, {
      title: 'Pricing Information',
      text: `When viewing a player for the first time, the prices will
             automatically update based on the settings you have configured.
             <br /><br />
             <small>
             <b>LOWEST BIN</b> is the lowest price currently on the transfer market.<br />
             <b>BUY FOR</b> is what we are willing to pay for this card.<br />
             <b>SELL FOR</b> is our starting bid when we list this card for sale.<br />
             <b>SET BIN</b> is our "buy it now" price when we list this card for sale.
             </small>`,
      selector: '.ut-bio-prices',
      position: 'left',
    }, {
      title: 'Update Price',
      text: 'If you ever need to manually re-check pricing, you can do so by clicking here.',
      selector: '.player-screen .action',
      position: 'bottom',
      allowClicksThruHole: true,
    }, {
      title: 'Individual Settings',
      text: `You can customize player settings individually by clicking here.  This is also
             where you would go to manually set the player's price.  Be sure to uncheck
             auto update if that is what you want to do!`,
      selector: '.details-subheader-tabs .player-settings',
      position: 'left',
      allowClicksThruHole: false,
    }, {
      title: 'Price History',
      text: `This tab will give you additional information about historical pricing
             for the player, as well as what your profit from bidding on this player
             has been.`,
      selector: '.details-subheader-tabs .player-history',
      position: 'left',
      allowClicksThruHole: false,
    }, {
      title: 'Bidding Overview',
      text: 'Click here in order to access the bidding screen.',
      selector: '.sidebar-containers ul li',
      position: 'right',
      allowClicksThruHole: true,
    }, {
      title: 'Tradepiles',
      text: 'This is a real time view of what is currently in your Watchlist, Transfer List, and Unassigned piles.',
      selector: '.details-panel .left',
      position: 'right',
    }, {
      title: 'Market Statistics',
      text: 'Here, you can see information about how the market is currently performing, as well as your profit.',
      selector: '.details-panel .right',
      position: 'left',
    }, {
      title: 'Start Bidding',
      text: 'Click here to start/stop the auto buyer',
      selector: '.bidding-screen .action',
      position: 'bottom',
      allowClicksThruHole: true,
    }, {
      title: 'Bidding Logs',
      text: 'If you want a more detailed view about what is going on, take a look at the logs.',
      selector: '.logs-link',
      position: 'left',
      allowClicksThruHole: true,
    }, {
      title: 'Session Logs',
      text: `This will display detailed information about what the auto buyer is doing.
             It clears out at the beginning every bidding session when you click "play".`,
      selector: '.mini-logs',
      position: 'bottom',
      allowClicksThruHole: true,
    }, {
      title: 'Available Credits',
      text: 'Your available credits will always update here as the auto buyer is running.',
      selector: '.login-wrapper .login',
      position: 'bottom',
    }, {
      title: 'Toggle Bidding',
      text: 'No matter where you are in the app, you can always start/stop bidding by clicking here.',
      selector: '.sidebar-buttons .btn-bidding',
      position: 'top',
    }];

    return (
      <div className="containers">
        {
          this.props.skipTutorial
          ?
            null
          :
            <Joyride
              ref={c => (this.joyride = c)}
              steps={steps}
              stepIndex={0}
              autoStart={!Object.keys(players).length}
              type="continuous"
              showSkipButton
              showStepsProgress
              disableOverlay
              run
              locale={{ back: 'Back', close: 'Close', last: 'Done', next: 'Next', skip: 'Skip' }}
            />
        }
        <ConnectedHeader hideLogin={false} />
        <div className="containers-body">
          <div className="sidebar">
            <section className={sidebarHeaderClass}>
              <h4>Player List</h4>
              <div className="create">
                {
                  this.props.location.pathname === '/players'
                  ?
                    null
                  :
                    <Link to="/players">
                      <span className="btn btn-new btn-action has-icon btn-hollow">
                        <span className="icon icon-search" />Search
                      </span>
                    </Link>
                }
              </div>
            </section>
            <section className="sidebar-containers" onScroll={this.handleScroll.bind(this)}>
              <ul>
                <div ref={node => (this.node = node)}>
                  <Link to="/players/overview">
                    <li id="overview">
                      <div className={overviewClasses} />
                      <div className="info">
                        <div className="name">
                          Bidding Overview
                        </div>
                        <div className="image">
                          Review bidding status
                        </div>
                      </div>
                    </li>
                  </Link>
                </div>
                <div className="player-list">
                  {players}
                </div>
              </ul>
            </section>
            <section className="sidebar-buttons">
              <span className="btn-sidebar btn-database" onClick={this.handleClickClearList.bind(this)}>
                <span className="text">Clear List</span>
              </span>
              <span className="btn-sidebar btn-preferences" onClick={() => { this.context.router.push('/settings'); }}>
                <span className="icon icon-preferences" />
              </span>
              {
                this.props.bidding
                ?
                  (<span className="btn-sidebar btn-stop btn-bidding" onClick={() => this.handleToggleBidding()}>
                    <span className="icon icon-stop" />
                  </span>)
                :
                  (<span className="btn-sidebar btn-start btn-bidding" onClick={() => this.handleToggleBidding()}>
                    <span className="icon icon-start" />
                  </span>)
              }
            </section>
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

Players.propTypes = {
  children: PropTypes.element.isRequired,
  player: PropTypes.shape({}),
  history: PropTypes.shape({}),
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
  bidding: PropTypes.bool,
  skipTutorial: PropTypes.bool,
  start: PropTypes.func,
  stop: PropTypes.func,
  clear: PropTypes.func,
};

Players.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    player: state.player,
    history: state.history,
    bidding: state.bid.bidding,
    skipTutorial: state.settings.skipTutorial
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...PlayerActions, ...BidActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Players);
