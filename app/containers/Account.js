import React, { Component, PropTypes } from 'react';
import { shell } from 'electron';
import validator from 'validator';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RetinaImage from 'react-retina-image';
import ConnectedHeader from '../components/Header';
import metrics from '../utils/MetricsUtil';
import * as AccountActions from '../actions/account';

export class Account extends Component {
  constructor(props) {
    super(props);
    this.next = props.next || undefined; // only set in tests
    this.state = {
      twoFactor: false,
      loading: false,
      errors: {}
    };
  }

  componentDidMount() {
    if (this.props.account.platform) {
      this.platformSelect.style.color = '#556473';
    } else {
      this.emailInput.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ errors: nextProps.errors || {} });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextState.twoFactor !== this.state.twoFactor
      || nextState.loading !== this.state.loading
      || (nextState.errors && nextState.errors !== this.state.errors));
  }

  validate() {
    const errors = {};
    if (!validator.isEmail(this.props.account.email || '')) {
      errors.email = 'Must be an email address';
    }

    // Your password must be 8 - 16 characters,
    // and include at least one lowercase letter,
    // one uppercase letter, and a number
    if (!validator.matches(
      this.props.account.password || '',
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/)
    ) {
      errors.password = (<span>Your password must be 8 - 16 characters, and include at least<br />
        one lowercase letter, one uppercase letter, and a number<br /><br /></span>);
    }

    if (validator.isEmpty(this.props.account.secret || '')) {
      errors.secret = 'The answer to your secret question is required.';
    }

    if (validator.isEmpty(this.props.account.platform || '')) {
      errors.platform = 'The platform you play on is required.';
    }

    if (
      this.state.twoFactor
      && (
        !this.props.account.code
        || this.props.account.code.length !== 6
        || !validator.isNumeric(this.props.account.code)
      )
    ) {
      errors.code = 'Code is invalid.  Must be 6 numbers.';
    }

    return errors;
  }

  handleChange(event) {
    this.props.setAccountInfo(event.target.name, event.target.value);

    // Change color back to dark gray on change
    if (event.target.name === 'platform') {
      const node = event.target;
      node.style.color = '#556473';
    }
  }

  handleBlur(event) {
    this.setState({ errors: _.omitBy(
      this.validate(),
      (val, key) => key !== event.target.name && !_.get(this.props.account, `[${key}].length`, 0)
    ) });
  }

  async handleLogin(event) {
    event.preventDefault();
    const errors = this.validate();
    this.setState({ errors });
    if (_.isEmpty(_.omit(errors, ['detail']))) {
      this.setState({ loading: true });
      if (this.next !== undefined) {
        this.next(this.props.account.code);
      } else {
        try {
          await this.props.login(
            this.props.account,
            // Two factor callback
            () => {
              this.setState({ twoFactor: true, loading: false });
              metrics.track('Two Factor Authentication Required');
              return new Promise(resolve => {
                this.next = resolve;
              });
            },
            // Captcha callback
            () => {}
          );
        } catch (e) {
          this.setState({ loading: false, errors: { detail: e.message } });
        }
      }
    }
  }

  handleSkip() {
    this.context.router.push('/players');
  }

  handleClickForgotPassword() {
    shell.openExternal('https://signin.ea.com/p/web/resetPassword');
  }

  render() {
    const { email, password, secret, platform, code } = this.props.account;
    const loading = this.state.loading ? <div className="spinner la-ball-clip-rotate la-dark"><div /></div> : null;
    let skip = '';
    if (process.env.NODE_ENV === 'development') {
      skip = (
        <a className="btn btn-action btn-skip" disabled={this.state.loading} onClick={this.handleSkip.bind(this)}>
          Skip
        </a>
      );
    }
    let fields;
    if (this.state.twoFactor) {
      fields = (
        <div key="two-factor">
          <input
            ref={codeInput => (this.codeInput = codeInput)} maxLength="6" name="code" placeholder="Two Factor Code"
            value={code || ''} type="text" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
          />
          <p className="error-message">{this.state.errors.code || 'A code was sent to your email or smartphone'}</p>
        </div>
      );
    } else {
      fields = (
        <div key="initial-credentials">
          <input
            ref={emailInput => (this.emailInput = emailInput)} maxLength="30" name="email" placeholder="Email"
            value={email || ''} type="text" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
          />
          <p className="error-message">{this.state.errors.email}</p>
          <input
            ref={passwordInput => (this.passwordInput = passwordInput)} name="password" placeholder="Password"
            value={password || ''} type="password" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
          />
          <p className="error-message">{this.state.errors.password}</p>
          <a className="link" onClick={this.handleClickForgotPassword}>Forgot your password?</a>
          <input
            ref={secretInput => (this.secretInput = secretInput)} name="secret" placeholder="Secret Question Answer"
            value={secret || ''} type="password" onChange={this.handleChange.bind(this)} onBlur={this.handleBlur.bind(this)}
          />
          <p className="error-message">{this.state.errors.secret}</p>
          <select
            ref={platformSelect => (this.platformSelect = platformSelect)} name="platform"
            value={platform || ''} onChange={this.handleChange.bind(this)}
          >
            <option disabled value="">Platform</option>
            <option value="pc">PC</option>
            <option value="xone">Xbox One</option>
            <option value="x360">Xbox 360</option>
            <option value="ps4">Playstation 4</option>
            <option value="ps3">Playstation 3</option>
          </select>
          <p className="error-message">{this.state.errors.platform}</p>
        </div>
      );
    }
    return (
      <div className="setup">
        <ConnectedHeader hideLogin />
        <div className="setup-content">
          {skip}
          <div className="form-section">
            <RetinaImage src={'images/connect-to-hub.png'} checkIfRetinaImgExists={false} />
            <form className="form-connect">
              {fields}
              <p className="error-message">{this.state.errors.detail}</p>
              <div className="submit">
                {loading}
                <button
                  className="btn btn-action" disabled={this.state.loading}
                  onClick={this.handleLogin.bind(this)} type="submit"
                >Log In</button>
              </div>
            </form>
          </div>
          <div className="desc">
            <div className="content">
              <h1>Connect to EA Sports</h1>
              <p>
                Automate your transfer market bidding by connecting
                your Origin account to FIFA Autobuyer.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Account.propTypes = {
  setAccountInfo: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  account: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
    secret: PropTypes.string,
    platform: PropTypes.string,
    code: PropTypes.string,
  }),
  next: PropTypes.func // only used for tests
};

Account.contextTypes = {
  router: PropTypes.object.isRequired,
  store: PropTypes.object
};

function mapStateToProps(state) {
  return {
    account: state.account
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(AccountActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Account);
