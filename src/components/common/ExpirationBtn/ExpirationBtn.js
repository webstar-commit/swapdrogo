import React from 'react';
import ToggleDisplay from 'react-toggle-display';
import ReactSVG from 'react-svg'

import AllStrings from '../../../constants/strings';
import * as Language from '../../../helpers/language';
import './ExpirationBtn.css';
import EXPIRATION_REFRESH_SVG from '../../../static/images/btn/baseline-circle.svg';

const Strings = AllStrings[Language.getLanguage().code].Trade;

class ExpirationBtn extends React.Component {

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
      <div className="expiration-d">
        <button className={`btn m-auto d-block button-bar-btn bar-btn`} style={this.state.show ? {background:'#7234c5', color: '#fff'}:{}} onClick={ () => this.handleClick() }>{Strings.BUTTONBAR.expirationButton}</button>
        {
          this.state.show &&
          <ToggleDisplay show={true}>
            <div className="d-flex expiration-inner-d">
              <span className="hours">Hours</span>
              <ReactSVG src={EXPIRATION_REFRESH_SVG} svgClassName="svg cursor-pointer" />
              <span className="circle minus cursor-pointer"></span>
              <span className="circle-v">24</span>
              <span className="circle plus cursor-pointer"></span>
            </div>
            
          </ToggleDisplay>
        }
      </div>
    )
  }
}

export default ExpirationBtn;
