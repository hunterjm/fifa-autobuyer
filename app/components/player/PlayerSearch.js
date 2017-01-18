import React, { PropTypes, Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';
import PlayerCard from './SmallPlayerCard';
import * as PlayerActions from '../../actions/player';

let searchTimeout;

export class PlayerSearch extends Component {
  constructor(props) {
    super(props);
    const { query } = this.props.location || { query: {} };
    this.state = {
      query: '', // TODO: move to redux state
      filter: query.filter || 'players', // TODO: move to redux state
      loading: false,
      error: false
    };
  }

  componentDidMount() {
    this.searchInput.focus();
  }

  componentWillReceiveProps() {
    this.setState({ loading: false });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.results === this.props.results
      && nextProps.location === this.props.location
      && nextState.loading === this.state.loading
      && nextState.error === this.state.error
    ) {
      return false;
    }
    return true;
  }

  componentWillUnmount() {
    /* istanbul ignore if */
    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
      searchTimeout = undefined;
    }
  }

  search(query, page = 1) {
    /* istanbul ignore if */
    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
      searchTimeout = undefined;
    }

    if (query !== '') {
      this.setState({ loading: true });
      searchTimeout = window.setTimeout(() => {
        this.props.search(query, page);
      }, 500);
    }
  }

  handleChange(e) {
    const query = e.target.value;
    if (query === this.state.query) {
      return;
    }
    this.setState({ query });
    return this.search(query);
  }

  handlePage(page) {
    this.search(this.state.query, page);
  }

  handleFilter(filter) {
    this.context.router.push({ pathname: '/players', query: { filter } });
    this.setState({ filter });
  }

  render() {
    const filter = this.state.filter;
    const query = this.state.query || '';
    const currentPage = _.get(this.props.results, 'page', 0);
    const totalPages = _.get(this.props.results, 'totalPages', 0);
    let players = _.get(this.props.results, 'items', []);

    let results;
    let paginateResults;
    const previous = [];
    const next = [];
    if (currentPage > 1) {
      let previousPage = currentPage - 7;
      if (previousPage < 2) {
        previousPage = 2;
      }
      previous.push((
        <li key="page-first">
          <a onClick={this.handlePage.bind(this, 1)} aria-label="First">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
      ));
      for (previousPage; previousPage < currentPage; previousPage += 1) {
        previous.push((
          <li key={`page-${previousPage}`}><a onClick={this.handlePage.bind(this, previousPage)}>{previousPage}</a></li>
        ));
      }
    }
    if (currentPage < totalPages) {
      let nextPage = currentPage + 1;
      for (nextPage; nextPage < totalPages; nextPage += 1) {
        next.push((
          <li key={`page-${nextPage}`}><a onClick={this.handlePage.bind(this, nextPage)}>{nextPage}</a></li>
        ));
        if (nextPage > currentPage + 6) {
          /* istanbul ignore next */
          break;
        }
      }
      next.push((
        <li key="page-last">
          <a onClick={this.handlePage.bind(this, totalPages)} aria-label="Last">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      ));
    }

    const current = (
      <li className="active">
        <span>{currentPage} <span className="sr-only">(current)</span></span>
      </li>
    );
    paginateResults = (next.length || previous.length) && (query !== '') ? (
      <nav>
        <ul className="pagination">
          {previous}
          {current}
          {next}
        </ul>
      </nav>
    ) : null;

    if (this.state.error) {
      results = (
        <div className="no-results">
          <h2>There was an error searching.  Check your internet connection.</h2>
        </div>
      );
      paginateResults = null;
    } else if (this.state.loading) {
      results = (
        <div className="no-results">
          <div className="loader">
            <h2>Loading Players</h2>
            <div className="spinner la-ball-clip-rotate la-dark la-lg"><div /></div>
          </div>
        </div>
      );
    } else if (players.length) {
      players = players
        .map(player => <PlayerCard key={player.id} player={player} />);

      results = (
        <div className="result-grids">
          <div>
            <h4>Matched Players</h4>
            <div className="result-grid">
              {players}
            </div>
          </div>
        </div>
      );
    } else if (query.length) {
      results = (
        <div className="no-results">
          <h2>Cannot find a matching player.</h2>
        </div>
      );
    } else {
      results = (
        <div className="no-results">
          <h2>Search for players above.</h2>
        </div>
      );
    }

    const loadingClasses = classNames({
      hidden: !this.state.loading,
      spinner: true,
      loading: true,
      'la-ball-clip-rotate': true,
      'la-dark': true,
      'la-sm': true
    });

    const magnifierClasses = classNames({
      hidden: this.state.loading,
      icon: true,
      'icon-search': true,
      'search-icon': true
    });

    const playerFilterClass = classNames({
      'results-filter': true,
      'results-all': true,
      tab: true,
      active: filter === 'players'
    });

    const searchDisabled = this.state.filter !== 'players';

    return (
      <div className="details">
        <div className="new-container">
          <div className="new-container-header">
            <div className="search">
              <div className="search-bar">
                <input
                  type="search" ref={searchInput => (this.searchInput = searchInput)} className="form-control"
                  placeholder="Search for Players" disabled={searchDisabled} onChange={this.handleChange.bind(this)}
                />
                <div className={magnifierClasses} />
                <div className={loadingClasses}><div /></div>
              </div>
            </div>
            <div className="results-filters">
              <span className="results-filter results-filter-title">FILTER BY</span>
              <span
                className={playerFilterClass}
                onClick={this.handleFilter.bind(this, 'players')}
              >Players</span>
            </div>
          </div>
          <div className="results">
            {results}
          </div>
          <div className="pagination-center">
            {paginateResults}
          </div>
        </div>
      </div>
    );
  }
}

PlayerSearch.propTypes = {
  search: PropTypes.func.isRequired,
  results: PropTypes.shape({}),
  location: PropTypes.shape({})
};

PlayerSearch.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    results: state.player.search,
    location: state.routing.locationBeforeTransitions
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(PlayerActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerSearch);
