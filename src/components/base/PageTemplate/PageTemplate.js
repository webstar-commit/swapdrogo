import React from 'react';

import Loader from 'react-loader-spinner';
import Header from '../Header';
import Footer from '../Footer';
import {currenciesJSON} from '../../../constants/currencies1';

import {
  getUserAddr
} from '../../../helpers/transaction';

export default class PageTemplate extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      authData: {}
    };
    this.startPollingForMetamaskAddress();

  }

  startPollingForMetamaskAddress = () => {
   let address = getUserAddr();
   const pollingIntervalId = setInterval(() => {
      const polledAddress = getUserAddr();
      // Request all of the tokens and their details from the 0x Token Registry
      if (address !== polledAddress) {
        address = polledAddress;
        this.forceUpdate();
      }
    }, 3000);
  }   

  componentDidMount () {
    if (window.web3) {  
      this.fetchInitial();
    } else {
      this.setCurrencies(1);
    }
  }

  fetchInitial = () => {
    window.web3.version.getNetwork((versionErr, networkId) => {
      if (!versionErr) {
        // no web3 detected
        this.setCurrencies(networkId);
      } else {
        console.log('Something went wrong!');
      }
    })
  }

  setCurrencies = (networkId) => {
    networkId = parseInt(networkId, 10);
    //task - import correct currenciesList depending on networkId
    const currencies = [];
    // console.log(JSON.stringify(currenciesJSON[networkId]));
    for (var key in currenciesJSON[networkId]) {
        currencies.push(currenciesJSON[networkId][key]);
    };
    this.setState({
      networkId,
      currencies,
      initialFetched: true,
    });
      
  }

  setSignedIn = ({ signedIn, authData }) => {
    this.setState({
      signedIn,
      authData
    });
  }

  render () {
    const {
      component: Component,
      ...props
    } = this.props;

    const {
      initialFetched,
      currencies,
      networkId,
      signedIn,
      authData,
    } = this.state;

    const meta = {
      currencies,
      networkId,
      userAddress: getUserAddr(),
      signedIn,
      authData,
      setSignedIn: this.setSignedIn.bind(this)
    };

    if (!initialFetched) {
      return (
        <div className="container my-5 text-center">
          <Loader type="Circles" color="#DD3BAD" />
        </div>
      );
    }

    return (
      <React.Fragment>
        <Header {...props} meta={meta} />
        <Component {...props} meta={meta} />
        <Footer {...props} meta={meta} />
      </React.Fragment>
    )
  }
}
