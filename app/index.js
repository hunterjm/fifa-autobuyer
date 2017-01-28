import _ from 'lodash';
import { ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import Promise from 'bluebird';
import routes from './routes';
import configureStore from './store/configureStore';
import webUtil from './utils/WebUtil';
import metrics from './utils/MetricsUtil';
import { initialState as accountState } from './reducers/account';
import { initialState as playerState } from './reducers/player';
import { initialState as bidState } from './reducers/bid';
import { initialState as settingsState } from './reducers/settings';
import { initialState as appState } from './reducers/app';

webUtil.addWindowSizeSaving();
webUtil.disableGlobalBackspace();
Promise.config({ cancellation: true });

metrics.track('Started App');
metrics.track('app heartbeat');
setInterval(() => {
  metrics.track('app heartbeat');
}, 14400000);

const initialState = _.merge(
  {},
  {
    account: accountState,
    player: playerState,
    bid: bidState,
    settings: settingsState,
    app: appState
  },
  JSON.parse(localStorage.getItem('state')) || {}
);
const store = configureStore(initialState);
const history = syncHistoryWithStore(hashHistory, store);

// Listen for messages from the auto updater
ipcRenderer.on('updates', (event, updates) => {
  store.dispatch({ type: 'app/set/updates', updates });
});

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>,
  document.getElementById('root')
);
