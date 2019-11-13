import React from 'react';
import Loader from 'react-loader-spinner';
import ReactSVG from 'react-svg';
import Clipboard from 'react-clipboard.js';
import AllStrings from '../../../constants/strings';
import * as Language from '../../../helpers/language';
import './ModalBody.css';
import CANCEL_SVG from '../../../static/images/cancel.svg';
import METAMASK_SVG from '../../../static/images/metamask.svg';
import HELP_SVG from '../../../static/images/help.svg';
import FACEBOOK_SVG from '../../../static/images/footer/facebook.svg';
import TWITTER_SVG from '../../../static/images/footer/twitter.svg';
import MAIL_SVG from '../../../static/images/footer/mail.svg';
import { UncontrolledTooltip } from 'reactstrap';


const ModalCommonStrings = AllStrings[Language.getLanguage().code].ModalCommon;
const ModalShareStrings = AllStrings[Language.getLanguage().code].ShareModal;

export const ModalBody = ({
  heading, headerSVG, text, linkURL, metamaskPending, pending, onCTA, onClose, ctaText, linkText, tradeHeading
}) => (
  <div className="modal-content">
    <div className="modal-header">
      <button type="button" className="close" onClick={onClose}>
        <ReactSVG svgStyle={{width: '14px'}} src={CANCEL_SVG} />
      </button>
    </div>
    <div className="modal-body">
      <div className="row justify-content-center">
        {tradeHeading && (
          <div className="trade-heading col-12 d-flex justify-content-around">
            <div className="d-inline-block position-relative">
              <img className="img-fluid" style={{maxWidth: '80px'}} src={tradeHeading.images[0]} />
              <img className="img-fluid position-absolute" style={{width: '40px', height:'40px', top: '26px', right: '27px'}} src={tradeHeading.innerImages[0]} />
              <h4 className="box-text">{tradeHeading.amounts[0]} <span>{tradeHeading.makerSymbol}</span></h4>
            </div>
            <ReactSVG src={tradeHeading.arrowsSVG} svgStyle={{maxWidth: '52px'}} />
            <div className="d-inline-block position-relative">
              <img className="img-fluid" style={{maxWidth: '80px'}} src={tradeHeading.images[1]} />
              <img className="img-fluid position-absolute" style={{width: '40px', height:'40px', top: '26px', right: '27px'}}  src={tradeHeading.innerImages[1]} />
              <h4 className="box-text">{tradeHeading.amounts[1]} <span>{tradeHeading.takerSymbol}</span></h4>
            </div>
          </div>
        )}
        {headerSVG && (
        <div className="col-12 text-center">
          <ReactSVG svgStyle={{height: '68px'}} src={headerSVG} />
        </div>
        )}
        {heading && (
        <div className="row">
          <div className="col-12 text-center">
            <h2>{heading}</h2>
          </div>
        </div>
        )}
        <div className="col-12 text-center">
          <p>{text}</p>
          {linkText && (
            <p className="text-center text-underline font-italic cursor-pointer">
              <a target="_blank" href={linkURL}>{linkText}</a>
            </p>
          )}
        </div>
      </div>
      {onCTA && (
        <div className="row my-3">
          <div className="col-12">
            <button className={`btn btn-primary btn-block ${pending ? 'btn-disabled' : ''}`} disabled={pending} onClick={onCTA}>{ctaText}</button>
          </div>
        </div>
      )}
      {pending && (
        <div className="row my-3">
          <div className="col-12">
            <div className="LoaderWithText text-center">
              <Loader type="Circles" color="#DD3BAD" height={18} width={18} />
              <div className="bottomText"> {ModalCommonStrings.MINING}</div>
            </div>
          </div>
        </div>
      )}
      {metamaskPending && (
        <div className="row my-3">
          <div className="col-12">
            <div className="LoaderWithText text-center">
              <ReactSVG svgStyle={{width: '24px', height: '24px'}} src={METAMASK_SVG} />
              <div className="bottomText">{ModalCommonStrings.METAMASKCONFIRM}</div>
            </div>
          </div>
        </div>
      )}
    </div>
      <div className="modal-foot">
          <p className="modalFooterText text-left">BLOCKSWAP</p>
          {/*<div className="d-inline-block help"><ReactSVG svgStyle={{maxWidth: '14px'}} src={HELP_SVG} data-toggle="tooltip" data-placement="top" title="hllll" /></div>     */}
      </div>

  </div>
)


export const ModalShareBody = ({
  orderJSON, orderStatusUrl, onClose
}) => (<div className="modal-content">
    <div className="modal-header">
      <button type="button" className="close" onClick={onClose}>
        <ReactSVG svgStyle={{width: '14px'}} src={CANCEL_SVG} />
      </button>
    </div>
    <div className="modal-body json-order">
      <div className="row">
        <div>
          <p className="title">{ModalShareStrings.TITLE}</p>
          <p>{ModalShareStrings.DESCRIPTION}</p>
          <p className="desc">{ModalShareStrings.YOURORDER}</p>
          <div>
            <textarea readOnly className="order-textarea" value={orderJSON}/>
            <div id="orderJSON">
            <Clipboard className="textarea-copy btn btn-outline-secondary" data-clipboard-text={orderJSON}>
              copy
            </Clipboard>
              <UncontrolledTooltip placement="top" target="orderJSON" trigger="click">
                Copied!
              </UncontrolledTooltip>
              </div>
          </div>
          <p className="desc"> {ModalShareStrings.SHARE}</p>
          <div className="input-group mb-3">
            <input readOnly type="text" className="form-control" value={orderStatusUrl} aria-label="Recipient's username" aria-describedby="button-addon2"/>
            <div id="statusUrl" className="input-group-append">
              <Clipboard className="btn btn-outline-secondary" data-clipboard-text={orderStatusUrl}>
                copy
              </Clipboard>
              <UncontrolledTooltip placement="top" target="statusUrl" trigger="click">
                Copied!
              </UncontrolledTooltip>
            </div>
          </div>
        </div>
      </div>
      <div className="row pt-3">
          <a
            className="social-icon"
            href={`fb-messenger://share/?link=${orderStatusUrl}`}>
            <ReactSVG svgStyle={{width: '22px', maxHeight: '22px'}} src={FACEBOOK_SVG} />
            </a>
            <a
            className="social-icon"
            href="#">
            <ReactSVG svgStyle={{width: '22px', maxHeight: '22px'}} src={TWITTER_SVG} />
            </a>
            <a
            className="social-icon"
            href="#">
            <ReactSVG svgStyle={{width: '22px', maxHeight: '22px'}} src={MAIL_SVG} />
            </a>
      </div>
    </div>
  </div>
)
