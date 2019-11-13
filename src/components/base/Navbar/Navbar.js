import React from 'react';
import { Link } from 'react-router-dom';
import ReactSVG from 'react-svg'

import './Navbar.css';

import AllStrings from '../../../constants/strings';
import * as Language from '../../../helpers/language';
import LOGO_SVG from '../../../static/images/logo.svg';
import ADD_SVG from '../../../static/images/add.svg';
import SEARCH_SVG from '../../../static/images/search.svg';
import DROPDOWNARROW_SVG from '../../../static/images/arrowdown.svg';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';


// TODO: Update these methods and their usage.
const getNotificationCount = () => 16;

const Strings = AllStrings[Language.getLanguage().code].Navbar;

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
  }

  getLanguageListener = code => event => {
    event.preventDefault();
    Language.setLanguage(code);
    window.location.reload();
  }

  addressInputChange = event => this.setState({
    searchAddress: event.target.value
  });

  search = event => {
    event.preventDefault();
    if (this.state.searchAddress) {
      this.props.history.push(`/status/${this.state.searchAddress}`)
    }
  }

  render () {
    const languages = Language.getAllLanguages().map(lang => 
      <DropdownItem key={`lang_${lang.code}`} >
        <img className="flag" src={lang.icon_url} />
        {lang.display_name}
      </DropdownItem>
    );
    const selectedLanguage = Language.getLanguage();
    const walletAddr = this.props.meta.userAddress;

    let notificationCount = getNotificationCount();
    if (notificationCount > 9) {
      notificationCount = '9+';
    }
                  
    return (
      <nav className="navbar navbar-expand-lg navbar-light justify-content-start">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <ReactSVG src={LOGO_SVG} />
          </Link>
          <form onSubmit={this.search} className="SearchInput">
          <div className="has-search">
            <span className="form-control-feedback"><ReactSVG src={SEARCH_SVG} /></span>
            <input type="text" className="form-control" placeholder={Strings.PLACEHOLDER}   onChange={this.addressInputChange} />
          </div>
          </form>
          <div className="d-flex flex-fill justify-content-end" id="main-nav">
            <span className="nav-item">
              <Link to="/trade" className="nav-link" id="navbar-tradeBtn">
                New Swap
              </Link>
            </span>
              <UncontrolledDropdown>
                <DropdownToggle className="dropdown-toggle">
                    <img className="flag " src={selectedLanguage.icon_url} />
                    {selectedLanguage.display_name}
                    <img className="downarrow" src={DROPDOWNARROW_SVG} />
                </DropdownToggle>
                <DropdownMenu>
                  {languages}
                
                </DropdownMenu>
              </UncontrolledDropdown>
          </div>
          
        </div>
      </nav>
    )
  }
}