import $ from 'jquery';
import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from './Header';
import * as BidActions from '../../actions/bid';

export class Logs extends Component {
  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  componentDidUpdate() {
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    $('.full .wrapper').height(window.innerHeight - 132);
    const node = $('.logs').get()[0];
    node.scrollTop = node.scrollHeight;
  }

  render() {
    const logs = this.props.logs && this.props.logs.length ?
        this.props.logs.map((log, i) => {
          let error = null;
          if (log.error) {
            error = <pre>{JSON.stringify(log.error, null, 2)}</pre>;
          }
          return <div className={log.level} key={`log-${i}`}>{log.msg}{error}</div>;
        }) :
        'No logs yet for this bidding session.';

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
            <div className="full">
              <div className="mini-logs wrapper">
                <div className="widget">
                  <div className="top-bar">
                    <div className="text">Session Logs</div>
                    <div className="action" onClick={() => this.props.clearMessages()}>
                      <span className="icon icon-restart" />
                    </div>
                  </div>
                  <div className="logs">
                    {logs}
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

Logs.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.shape({})),
  clearMessages: PropTypes.func.isRequired,
  bidding: PropTypes.bool,
  start: PropTypes.func.isRequired,
  stop: PropTypes.func.isRequired,
};

Logs.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    bidding: state.bid.bidding,
    logs: state.bid.logs,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(BidActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Logs);
