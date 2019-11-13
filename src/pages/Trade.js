import React from 'react';
import { Redirect } from 'react-router';
import AllStrings from '../constants/strings';
import * as Language from '../helpers/language';
import { transformToContractData } from '../helpers/transform';
import ReactSVG from 'react-svg';
import {Modal, UncontrolledTooltip} from 'reactstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {
  grantUnlimitedAllowance,
  createAndSignOrder,
  isTokenAllowanceSufficient,
  createAssetData,
  waitForOrderMining,
  NULL_ADDRESS,
  nFormatter
} from '../helpers/transaction';
import 'react-datepicker/dist/react-datepicker.css';
import {ModalBody} from '../components/common/ModalBody/ModalBody';
import ExpirationBtn from '../components/common/ExpirationBtn';
import FilterBtn from '../components/common/FilterBtn';
import { PowerSelect } from 'react-power-select';
import '../css/Trade.css';
import axios from 'axios';

import ARROWS_SVG from '../static/images/arrows_rev.svg';
import PURPLE_BOX_EMPTY_IMG from '../static/images/purple_box_empty.png';
import PINK_BOX_EMPTY_IMG from '../static/images/pink_box_empty.png';
import HELP_SVG from '../static/images/help.svg';
import TRADE_SVG from '../static/images/icon-trade.svg';
import LOCK_SVG from '../static/images/lock.svg';
import METAMASK_SVG from '../static/images/metamask.svg';

import LEFTBACK_SVG from '../static/images/leftBack.svg';
import RIGHTBACK_SVG from '../static/images/rightBack.svg';

const Strings = AllStrings[Language.getLanguage().code].Trade;
const ModalStrings =  AllStrings[Language.getLanguage().code].Modal;
const ModalCommonStrings = AllStrings[Language.getLanguage().code].ModalCommon;
const MetamaskModalStrings = AllStrings[Language.getLanguage().code].MetamaskModal;

const fieldsOfToken = {
  erc20: [
    ['amount', 'tokenAddress', 'makerAddress'],
    ['amount', 'tokenAddress', 'takerAddress']
  ],
  erc721: [
    ['tokenId', 'tokenAddress', 'makerAddress'],
    ['tokenId', 'tokenAddress', 'takerAddress']
  ],
  erc721ck: [
    ['tokenId', 'tokenAddress', 'makerAddress'],
    ['tokenId', 'tokenAddress', 'takerAddress']
  ]
};
const defaultImages = [PURPLE_BOX_EMPTY_IMG, PINK_BOX_EMPTY_IMG];
const TOKEN_IMAGES = {
  erc721: {},
  erc721ck: {}
};
const optionalFields = [[], ['takerAddress']];

const DropdownComponent = ({ option }) => {
  const imageFile = "./img/tokenImages/" + option.image_file;
  return (      
    <div className="CurrencyDropdownOption">
      {option.image_file && (
        <img src={imageFile} />
      )}
      <div className="d-inline-block">
        <span>{option.symbol}</span> <span>{option.name}</span>
      </div>
    </div>
  );
};

export default class Trade extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      fields: [{
        makerAddress: props.meta.userAddress
      }, {}],
      currencies: [],
      allFields: [[], []],
      disabledFields: [
        ['makerAddress', 'tokenAddress'],
        ['tokenAddress']
      ],
      images: Array.from(defaultImages),
      innerImages: ["",""],
      modalShown: false,
      showInvalid: false,
      expDate: moment().add(10, 'day'),
    };

    this.toggleModal = this.toggleModal.bind(this);
  }

handleChange = date => {
  this.setState({expDate: date})
  this.toggleCalendar()
}

toggleCalendar = e => {
  e && e.preventDefault()
  this.setState({isOpen: !this.state.isOpen})
}

  /**
   * Sets image.
   * 
   * @param {Number} index
   */
  setImages = index => {
    const {
      currencies,
      fields,
      innerImages
    } = this.state;

    const currency = currencies[index];
    const field = fields[index]

    if (TOKEN_IMAGES[currency.type]) {
      TOKEN_IMAGES[currency.type] = {};
    }

    if (currency.type.indexOf('erc721') === 0) {
      innerImages[index] = "./img/tokenImages/" + currency.image_file;
      this.setState({
        innerImages
      });
      if (currency.ApiUrl && currency.imageApiField && field.tokenId) {
        if (TOKEN_IMAGES[currency.type][field.tokenId]) {
          innerImages[index] = TOKEN_IMAGES[currency.type][field.tokenId];
          this.setState({
            innerImages
          });
        } else {

          axios.get(`${currency.ApiUrl}${field.tokenId}`)
            .then(response => {
              const {
                data
              } = response;

              TOKEN_IMAGES[currency.type][field.tokenId] = data[currency.imageApiField];
              innerImages[index] = TOKEN_IMAGES[currency.type][field.tokenId];
              this.setState({
                innerImages
              });
            })
            .catch(err => {
              innerImages[index] = "";
              this.setState({
                innerImages
              });
            })
        }
      }
    } else if (currency.type.indexOf('erc20') === 0) {
      innerImages[index] = "./img/tokenImages/" + currency.image_file;
      this.setState({
        innerImages
      });
    }
  }

  /**
   * Sets the currency at the given index.
   */
  setCurrencyAtIndex  = index => ({ option }) => {
    const currency = option;
    const {
      currencies,
      fields,
      allFields
    } = this.state;

    currencies[index] = currency;
    allFields[index] = fieldsOfToken[currency.type][index];

    fields[index].tokenAddress = currency.address;

    this.setState({
      currencies,
      fields,
      allFields
    }, () => {
      this.setImages(index);
    });
  }

  /**
   * Updates the value of a field for a given index.
   */
  updateFieldValue = (index, field) => event => {
    const {
      fields
    } = this.state;

    if (!fields[index]) {
      fields[index] = {};
    }

    fields[index][field] = event.target.value;

    this.setState({
      fields
    }, () => {
      if (field === 'tokenId') {
        this.setImages(index);
      }
    });
  }

  /**
   * Returns the final values to be used based on the currencies.
   */
  getFinalValues = () => {
    const {
      currencies,
      fields,
      allFields
    } = this.state;
    const takerAddress = fields[1].takerAddress ? fields[1].takerAddress.toLowerCase() : NULL_ADDRESS;
    const finalFields = [
      {
        tokenId: fields[0].tokenId,
        amount: fields[0].amount,
        makerAddress: fields[0].makerAddress ? fields[0].makerAddress.toLowerCase() : '',
        tokenAddress: currencies[0] ? currencies[0].address.toLowerCase() : ''
      },
      {
        tokenId: fields[1].tokenId,
        amount: fields[1].amount,
        takerAddress: takerAddress,
        tokenAddress: currencies[1] ? currencies[1].address.toLowerCase(): ''
      }
    ]

    // Remove extra keys.
    finalFields.forEach((value, i) => {
      Object.keys(value).forEach(key => {
        if (allFields[i].indexOf(key) < 0) {
          delete finalFields[i][key]
        }
      });
    })

    return finalFields;
  }

  onSubmit = event => {
    event.preventDefault();
    const {
      fields
    } = this.state;
    if (this.isInvalid()) {
      this.setState({
        showInvalid: true
      });
      if (!window.web3 || !fields[0].makerAddress) {
        this.setState({
          modalStep: 3
        }, () => {
          this.showModal();
        })
      }
      return;
    }

    const {
      currencies,
      tokenTrade,
    } = this.state;

    const {
      network
    } = this.props;

    const values = transformToContractData(this.getFinalValues());

    const finalValues = this.getFinalValues();
    this.setState({
      loading: true,
      error: false,
    }, () => {
      const obj = {
        tokenAddress: finalValues[0].tokenAddress,
        tokenType: currencies[0].type
      };
      
      if (finalValues[0].amount) {
        obj.tokenAmount = finalValues[0].amount;
      }

      if (finalValues[0].tokenId) {
        obj.tokenId = finalValues[0].tokenId
      }

      isTokenAllowanceSufficient(obj)
        .then(sufficient => {
          if (sufficient) {
            this.setState({
              modalStep: 2
            }, () => {
              this.showModal();
            })
          } else {
            this.setState({
              modalStep: 1
            }, () => {
              this.showModal();
            })
          }
        })
        .catch((error) => {
          debugger;
          this.setState({
            metamaskPending: false,
            pending:false,
            loading: false,
            error: true
          });
        });
    });
  }

  sign = () => {
    this.setState({
      metamaskPending: true,
      pending: false,
      loading: true,
      error: false
    });

    const finalValues = this.getFinalValues();
    if (finalValues[0].tokenId) {
      this.state.currencies[0].tokenId = finalValues[0].tokenId;
    }

    if (finalValues[1].tokenId) {
      this.state.currencies[1].tokenId = finalValues[1].tokenId;
    }

    const makerAssetData = createAssetData({
      tokenAddress: finalValues[0].tokenAddress,
      tokenType: this.state.currencies[0].type,
      tokenId: finalValues[0].tokenId
    });
    const takerAssetData = createAssetData({
      tokenAddress: finalValues[1].tokenAddress,
      tokenType: this.state.currencies[1].type,
      tokenId: finalValues[1].tokenId
    });

    createAndSignOrder({
      makerAddress: finalValues[0].makerAddress,
      takerAddress: finalValues[1].takerAddress,
      makerAssetData: makerAssetData,
      takerAssetData: takerAssetData,
      makerTokenAmount: finalValues[0].amount,
      takerTokenAmount: finalValues[1].amount,
      currencies: this.state.currencies,
      expirationTimeSeconds: this.state.expDate.unix()
    })
      .then((order) => {
      const modalShown = this.state.modalShown;
      this.setState({
        metamaskPending: false,
        pending: false,
        loading: false,
        error: false,
      }, () => {
        if (modalShown) {
          this.hideModal();
        }
        this.setState({
          contractAddress: JSON.stringify(order)
        });
      });
    })
      .catch(() => {
        this.setState({
          metamaskPending: false,
          pending:false,
          loading: false,
          error: true
        }, () => {
          this.hideModal();
        });
      });;
  }

  approve = () => {
    this.setState({
      loading: true,
      error: false,
      metamaskPending: true,
      pending:false
    });

    const finalValues = this.getFinalValues();
    const obj = {
      tokenAddress: finalValues[0].tokenAddress,
      tokenType: this.state.currencies[0].type
    };
    
    if (finalValues[0].tokenId) {
      obj.tokenId = finalValues[0].tokenId
    }

    grantUnlimitedAllowance(obj)
      .then(hash => {
        this.setState({
          approvalHash: hash,
          metamaskPending: false,
          pending:true
        });

        return waitForOrderMining({
          hash
        })
      })
      .then(receipt => {
        if (!this.state.modalShown) {
          return;
        }
        this.setState({
          metamaskPending: false,
          pending: false,
          modalStep: 2
        }, () => {
          this.showModal();
        });
      })
      .catch(() => {
        this.setState({
          metamaskPending: false,
          pending: false,
          loading: false,
          error: true
        }, () => {
          this.hideModal();
        });
      });;
  }

  toggleModal() {
    if (this.state.modalShown) {
      this.hideModal();
    } else {
      this.showModal();
    }
  }

  showModal = e => {
    if (e) {
      e.preventDefault();
    }
    this.setState({
      modalShown: true
    });
  }

  hideModal = e => {
    if (e) {
      e.preventDefault();
    }
    this.setState({
      loading: false,
      error: false,
      modalShown: false
    })
  }

  isInvalid = () => {
    const {
      currencies,
      fields,
      loading
    } = this.state;
    let isInvalid = false;
    if (!window.web3) {
      return true;
    }
    if (loading) {
      return true;
    }

    if (currencies.length !== 2) {
      return true;
    } else if (!currencies[0] || !currencies[1]) {
      return true;
    }

    currencies.forEach((currency, i) => {
      this.state.allFields[i].forEach(field => {
        if (optionalFields[i].indexOf(field) < 0 && !Boolean(fields[i] && fields[i][field])) {
          isInvalid = true;
        }
      })
    })

    return isInvalid;
  }

  getModalContents = step => {
    const {
      currencies,
      approvalHash,
      innerImages,
      images
    } = this.state;
    const fields = this.getFinalValues();

    switch (step) {
      case 1: {
          return { 
            headingText: ModalCommonStrings.UNLOCK,
            headingSVG: LOCK_SVG,
            text: (approvalHash ? "Transaction Hash:" : ModalStrings[currencies[0].type][step].TIME),
            linkText: (approvalHash),
            linkURL: '',
            onCTA: this.approve,
            ctaText: ModalStrings[currencies[0].type][step].APPROVE(currencies[0].symbol)
          };
      }

      case 2: {
        return {
          tradeHeading: {takerSymbol: currencies[1].symbol, makerSymbol: currencies[0].symbol, innerImages: innerImages, images: images, arrowsSVG: ARROWS_SVG, amounts: [nFormatter(fields[0].amount), nFormatter(fields[1].amount)]},
          text: ModalStrings[currencies[0].type][step].TIME,
          onCTA: this.sign,
          ctaText: ModalStrings[currencies[0].type][step].SIGN(currencies[0].symbol, nFormatter(fields[0].amount) || fields[0].tokenId, currencies[1].symbol, nFormatter(fields[1].amount) || fields[1].tokenId)
        };
      }

      case 3: {
        return {
          headingText: MetamaskModalStrings.TITLE,
          headingSVG: METAMASK_SVG,
          text: MetamaskModalStrings.DESCRIPTION,
          linkText: MetamaskModalStrings.LINKTEXT,
          linkURL: 'https://metamask.io/#how-it-works',
        };
      }

      default:
        break;
    }
  }

  componentDidUpdate (prevProps) {
    const {
      props,
      state
    } = this;
     /**
     * User just signed into MetaMask, set values.
     */
    if (prevProps.meta.userAddress !== props.meta.userAddress) {
      const { fields } = state;
       fields[0].makerAddress = props.meta.userAddress;
       this.setState({
        fields
      });
    }
  }

  componentDidMount () {
    
  }

  render () {

    const {
      currencies,
      contractAddress,
      loading,
      error,
      modalShown,
      modalStep,
      images,
      innerImages,
      metamaskPending,
      pending
    } = this.state;

    if (contractAddress) {
      return <Redirect to={{
        pathname: `/status/${contractAddress}`,
        state: {
          searchAddress: this.state.contractAddress
        }
      }} />
    }

    const fieldsToShow = currencies.map((currency, i) => {
      return this.state.allFields[i].map((field, j) => {
        const S = Strings.FIELDS[field];

        const fields = this.state.fields[i] || {};

        return (
          <div className="form-group" key={`fields_${i}_${field}`}>
            <label htmlFor={`fields_${i}_${field}`}>
              {S.name}
            </label>
            {S.help && (
              <div>
              <div id={`tip_${i}_${field}`} className="d-inline-block help"><ReactSVG svgStyle={{maxWidth: '14px'}} src={HELP_SVG} /></div>
              <UncontrolledTooltip placement="top" target={`tip_${i}_${field}`}>
                {S.help}
              </UncontrolledTooltip>
              </div>
            )}
            {S.asteriksMessage && (
              <label className="d-inline-block asteriks-message">{S.asteriksMessage}</label>
            )}
            <input
              className={`form-control ${(this.state.showInvalid && optionalFields[i].indexOf(field) < 0 && !fields[field]) ? 'is-invalid' : ''}`}
              type="text"
              name={field}
              id={`fields_${i}_${field}`}
              onChange={this.updateFieldValue(i, field)}
              value={fields[field] || ''}
              disabled={this.state.disabledFields[i].indexOf(field) >= 0}
            />
            {j === 0 && <span className="desc">Avail: 1,500</span> }
          </div>
        );
      });
    });

    let modalBody;
    let modalContents;
    if (modalShown) {
      modalContents = this.getModalContents(modalStep);
      modalBody = 
             <ModalBody
          heading={modalContents.headingText}
          headerSVG={modalContents.headingSVG}
          tradeHeading={modalContents.tradeHeading}
          text={modalContents.text}
          linkText={modalContents.linkText}
          linkURL={modalContents.linkURL}
          metamaskPending={metamaskPending}
          pending={pending}
          onCTA={modalContents.onCTA}
          onClose={this.hideModal}
          ctaText={modalContents.ctaText}
        />;
    }

    return <div className="Trade">
        <div className="Banner" style={{background: `url(${LEFTBACK_SVG}) left bottom no-repeat`}}>
          
            <div className="d-flex h-100 align-items-center justify-content-center" style={{background: `url(${RIGHTBACK_SVG}) right bottom no-repeat`}}>
              <h1>{Strings.HEADING}</h1>
              <span>{Strings.SUBHEADING}</span>
            </div>
          
        </div>
        <div className="buttons-bar">
          <div className="row btns-d justify-content-center">
            <div className="">
              <ExpirationBtn />
              <button className={`btn d-block bar-btn ml-3`} data-toggle="tooltip-instant" data-trigger="hover" data-placement="top" title={Strings.BUTTONBAR.instantButtonTip}>{Strings.BUTTONBAR.instantButton}</button>
              <FilterBtn />
            </div>
          </div>
        </div>
        <div className="ContentArea">
          <div className=" text-center">
            <form className="trade-container d-inline-block" onSubmit={this.onSubmit}>
              
              <div className="row d-none d-md-block text-center box-d">
                <div className="col-12">
                  <div className="d-inline-block position-relative">
                    <img className="img-fluid" style={{maxWidth: '100px'}} src={images[0]} />
                    <img className="img-fluid position-absolute" style={{width: '44px', height: '44px', top: '35px', right: '36px'}} src={innerImages[0]} />
                  </div>
                  <ReactSVG src={ARROWS_SVG} svgStyle={{maxWidth: '82px', maxHeight: '72px'}} />
                  <div className="d-inline-block position-relative">
                    <img className="img-fluid" style={{maxWidth: '100px'}} src={images[1]} />
                    <img className="img-fluid position-absolute" style={{width: '44px', height: '44px', top: '35px', right: '36px'}}  src={innerImages[1]} />
                  </div>
                </div>
              </div>
              <div className="row justify-content-between">

                <div style={{margin: '16px 8px'}} className="col-12 d-md-none text-center">
                  <div className="d-inline-block position-relative">
                    <img className="img-fluid" style={{maxWidth: '100px'}} src={images[0]} />
                    <img className="img-fluid position-absolute" style={{width: '44px', height: '44px', top: '35px', right: '36px'}} src={innerImages[0]} />
                  </div>
                </div>
                
                <div className="trade-rectangle marg-center marg-right-md">
                  <h4 className="text-uppercase">{Strings.SELLING}</h4>
                  <div className="form-group">
                    <PowerSelect
                      options={this.props.meta.currencies}
                      selected={this.state.currencies[0]}
                      optionComponent={<DropdownComponent />}
                      selectedOptionComponent={<DropdownComponent />}
                      onChange={this.setCurrencyAtIndex(0)}
                      placeholder="Select Currency"
                      searchIndices={['name', 'symbol']}
                      className={`CurrencyDropdown ${(this.state.showInvalid && !this.state.currencies[0]) ? 'is-invalid' : ''}`}
                    />
                    <span className="desc">Avail: 1,500</span>
                  </div>
                  {fieldsToShow[0]}
                </div>
                
                <div className="col-12 d-md-none text-center">
                  <ReactSVG src={ARROWS_SVG} svgClassName="Illustration Rotated pl-4" svgStyle={{ maxHeight: '64px' }}/>
                </div>
                <div style={{margin: '16px 8px'}} className="col-12 d-md-none text-center">
                  <div className="d-inline-block position-relative">
                    <img className="img-fluid" style={{maxWidth: '100px'}} src={images[1]} />
                    <img className="img-fluid position-absolute" style={{width: '44px', height: '44px', top: '35px', right: '36px'}}  src={innerImages[1]} />
                  </div>
                </div>
                
                
                <div className="trade-rectangle marg-center">
                  <h4 className="text-uppercase">{Strings.BUYING}</h4>
                  <div className="form-group">
                  <PowerSelect
                    options={this.props.meta.currencies}
                    selected={this.state.currencies[1]}
                    optionComponent={<DropdownComponent />}
                    selectedOptionComponent={<DropdownComponent />}
                    onChange={this.setCurrencyAtIndex(1)}
                    placeholder="Select Currency"
                    searchIndices={['name', 'symbol']}
                    className={`CurrencyDropdown ${(this.state.showInvalid && !this.state.currencies[1]) ? 'is-invalid' : ''}`}
              
                    required
                    />
                    <span className="desc">Avail: 1,500</span>
                  </div>
                  {fieldsToShow[1]}
                </div>
                
              </div>
              <div className="row">
                <div className="col-12">
                  <button className="btn big-btn btn-primary px-5 m-auto d-block create-btn" >{Strings.CTA}</button>
                  <div className="expire-desc">
                    <span>Expires</span>
                    <span>
                    <button
                        className="react-datepicker-btn"
                        onClick={this.toggleCalendar}>
                        {this.state.expDate.fromNow()}
                    </button>
                    {
                      this.state.isOpen && (
                        <DatePicker
                          selected={this.state.expDate}
                          onChange={this.handleChange}
                          minDate={moment().add(1,"days")}
                          timeIntervals={60}
                          onClickOutside={this.toggleCalendar}
                          showTimeSelect
                          withPortal
                          inline />
                      )

                    }
                </span>
                  </div>
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-12 col-md-6 col-lg-4 offset-lg-1">
                  {error && (
                    <p className="text-danger">{Strings.ERROR}</p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <Modal centered={true} isOpen={this.state.modalShown} toggle={this.toggleModal} >
          {modalBody}
        </Modal>
      </div>;
  }
}