import Fut from 'fut-promise';
import _ from 'lodash';

const logins = [];

export function init(account, tfAuthHandler, captchaHandler, rpm = 15) {
  let login = _.find(logins, { email: account.email });
  if (login === undefined) {
    let minDelay = 0;
    if (process.env.NODE_ENV === 'test') {
      // Tests are mocked, so no need to limit
      rpm = 0; // eslint-disable-line no-param-reassign
      minDelay = -100000; // Make sure  we won't ever delay in tests
    }
    if (rpm > 0) {
      minDelay = (60 / rpm) * 1000;
    }
    const api = new Fut({
      ...account,
      minDelay,
      captchaHandler,
      tfAuthHandler,
      saveVariable: (key, val) => {
        const apiVars = JSON.parse(window.localStorage.getItem(`${account.email}::apiVars`)) || {};
        _.set(apiVars, key, val);
        window.localStorage.setItem(`${account.email}::apiVars`, JSON.stringify(apiVars));
      },
      loadVariable: key => {
        const apiVars = JSON.parse(window.localStorage.getItem(`${account.email}::apiVars`)) || {};
        return _.get(apiVars, key, false);
      }
    });
    login = { email: account.email, api };
    logins.push(login);
  }
  return login.api;
}

export function getApi(email, rpm) {
  const login = _.find(logins, { email });
  if (rpm !== undefined) {
    if (rpm > 0) {
      login.api.options.minDelay = (60 / rpm) * 1000;
    } else {
      login.api.options.minDelay = 0;
    }
  }
  return login && login.api;
}
