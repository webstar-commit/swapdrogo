import React from 'react';
import AllStrings from '../../../constants/strings';
import * as Language from '../../../helpers/language';
import './Tagline.css';
import ReactSVG from 'react-svg'

import LOGONAME_SVG from '../../../static/images/logo_name.svg';
import FACEBOOK_SVG from '../../../static/images/footer/facebook.svg';
import TWITTER_SVG from '../../../static/images/footer/twitter.svg';
import YOUTUBE_SVG from '../../../static/images/footer/youtube.svg';
import MAIL_SVG from '../../../static/images/footer/mail.svg';

const Strings = AllStrings[Language.getLanguage().code].Tagline;

export default class Tagline extends React.Component {
  render () {
    return <div className="Tagline">
        <div className="container tagline">
          <div className="row first-row">
            <div className="tag-first col-12 col-lg-4">
              <div><img src={LOGONAME_SVG} style={{height: '28px'}} /></div>
              <div className="desc-text">
                {Strings.TAGLINE} <a className ="taglineLink" href="https://0xproject.com/">0xProtocol</a>.
              </div>
            </div>
            <div className="tag-help col-12 col-lg-4">
              <div>{Strings.HELP}</div>
              <div className="desc-text">
                Chat: <a className ="taglineLink" href="mailto:hello@boxylabs.com" >RocketChat</a><br/>
                {Strings.EMAIL}: <a className ="taglineLink" href="mailto:hello@boxylabs.com" >hello@boxylabs.com</a>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div>{Strings.DONATIONS}</div>
              <div className="desc-text">
                ETH: 0xDECAF9CD2367cdbb726E904cD6397eDFcAe6068D<br/>
                BTC: 1DECAF2uSpFTP4L1fAHR8GCLrPqdwdLse9
              </div>
            </div>
          </div>
          <div className="row second-row">
          <a
            className="social-icon"
            href="#">
            <ReactSVG src={FACEBOOK_SVG} />
            </a>
            <a
            className="social-icon"
            href="#">
            <ReactSVG src={TWITTER_SVG} />
            </a>
            <a
            className="social-icon"
            href="#">
            <ReactSVG src={YOUTUBE_SVG} />
            </a>
            <a
            className="social-icon"
            href="#">
            <ReactSVG src={MAIL_SVG} />
            </a>
          </div>
          <div className="line">
            <div>© BoxyLabs</div>
          </div>
        </div>
      </div>;
  }
}