// @flow

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route ,Switch } from "react-router-dom";
import {Status, Trade} from '../pages';
import PropTypes from 'prop-types';
import Screen from './base/PageTemplate';
import 'react-power-select/dist/react-power-select.css';
import '../css/overrides.css';
import '../css/main.css';

class App extends React.Component {
  static propTypes = {
    network: PropTypes.string,
    location: PropTypes.any,
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    
    const commonProps = {
      network: this.props.network
    };

    return (
      <React.Fragment>
        <Route
          exact
          path="/"
          render={props => (
            <Screen
              component={Trade}
              {...props}
              {...commonProps}
            />
          )}
        />

        <Route
          path="/trade"
          render={props => (
            <Screen
              component={Trade}
              {...props}
              {...commonProps}
            />
          )}
        />

        <Route
          path="/status"
          exact
          render={props => (
            <Screen
              component={Status}
              {...props}
              {...commonProps}
            />
          )}
        />

        <Route
          path="/status/:searchAddress"
          render={props => (
            <Screen
              component={Status}
              {...props}
              {...commonProps}
            />
          )}
        />


      </React.Fragment>
    );
  }
}

export default App;
