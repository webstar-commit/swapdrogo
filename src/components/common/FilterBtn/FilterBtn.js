import React from 'react';
import ToggleDisplay from 'react-toggle-display';
import ReactSVG from 'react-svg'

import AllStrings from '../../../constants/strings';
import * as Language from '../../../helpers/language';
import './FilterBtn.css';
import EXPIRATION_REFRESH_SVG from '../../../static/images/btn/baseline-circle.svg';

const Strings = AllStrings[Language.getLanguage().code].Trade;

class FilterBtn extends React.Component {

  constructor() {
    super();
    this.state = { show: false };
  }

  handleClick() {
    this.setState({
      show: !this.state.show
    });
  }

  render () {
    return (
      <div className="filter-d">
        <button className={`btn ml-3 d-block button-bar-btn bar-btn`} style={this.state.show ? {background:'#7234c5', color: '#fff'}:{}} onClick={ () => this.handleClick() }>{Strings.BUTTONBAR.moreButton}</button>
        {
          this.state.show &&
          <ToggleDisplay show={true}>
            <div className="d-flex filter-inner-d">
            </div>
            
          </ToggleDisplay>
        }
      </div>
    )
  }
}

export default FilterBtn;
