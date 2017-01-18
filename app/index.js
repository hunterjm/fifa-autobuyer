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

webUtil.addWindowSizeSaving();
webUtil.disableGlobalBackspace();
Promise.config({ cancellation: true });

metrics.track('Started App');
metrics.track('app heartbeat');
setInterval(() => {
  metrics.track('app heartbeat');
}, 14400000);

const initialState = JSON.parse(localStorage.getItem('state')) || undefined;
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
