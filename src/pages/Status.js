import React from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router';
import AllStrings from '../constants/strings';
import * as Language from '../helpers/language';
import Loader from 'react-loader-spinner';
import ReactSVG from 'react-svg';
import {Modal} from 'reactstrap';
import '../css/Status.css';
import moment from 'moment';

import {ModalBody, ModalShareBody} from '../components/common/ModalBody/ModalBody';
import {
  grantUnlimitedAllowance,
  isTokenAllowanceSufficient,
  getTransaction,
  fillOrder,
  cancelOrder,
  convertOrderToTransactionObject,
  waitForOrderMining,
  NULL_ADDRESS,
  getUserAddr,
  nFormatter
} from '../helpers/transaction';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

import LOCK_SVG from '../static/images/lock.svg';
import SUCCESS_POPUP_SVG from '../static/images/success_popup.svg';
import CANCEL_POPUP_SVG from '../static/images/cancel_popup.svg';
import ARROWS_SVG from '../static/images/arrows.svg';
import PURPLE_BOX_EMPTY_IMG from '../static/images/purple_box_empty.png';
import PINK_BOX_EMPTY_IMG from '../static/images/pink_box_empty.png';
import METAMASK_SVG from '../static/images/metamask.svg';

import LEFTBACK_SVG from '../static/images/left_background.svg';
import RIGHTBACK_SVG from '../static/images/right_background.svg';

const Strings = AllStrings[Language.getLanguage().code].Status;
const ModalStrings = AllStrings[Language.getLanguage().code].TakerModal;
const ModalCommonStrings = AllStrings[Language.getLanguage().code].ModalCommon;
const MetamaskModalStrings = AllStrings[Language.getLanguage().code].MetamaskModal;

const TOKEN_IMAGES = {
  erc721: {},
  erc721ck: {}
}

class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shortUrl: '',
      searchAddress: '',
      initialFetched: false,
      loading: false,
      images: {
        maker: PINK_BOX_EMPTY_IMG,
        taker: PURPLE_BOX_EMPTY_IMG,
      },
      innerImages: ["",""],
    };
    this.toggleModal = this.toggleModal.bind(this);

    try {
      this.state.searchAddress = props.match.params.searchAddress;
    } catch (setErr) {}

  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      searchAddress: nextProps.match.params.searchAddress,
      initialFetched: false,
      loading: false,
      metamaskPending: false
    }, () => {
      this.performSearch();
    });
  }

  componentDidMount() {
    if (this.state.searchAddress) {
      this.performSearch();
    }
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

  performSearch () {
    if (!window.web3) {
      return this.handleNoWeb3Connection(); 
    }
    getTransaction({
      order: JSON.parse(this.state.searchAddress)
    })
    .then(({
        order,
        currencies,
        orderInfo,
        amounts
      }) => {
      const newOrder = this.createNewOrder(order, currencies, orderInfo, amounts);
      this.setState({
        order: newOrder,
        currencies,
        loading: false,
        initialFetched: true,
        failed: false
      }, () => {
        this.updateImages();
        this.updateShortenImageUrl();
      });
    })
    .catch(() => {
      this.setState({
        loading: false,
        failed: true,
        initialFetched: true,
      });
    })
  }

  handleNoWeb3Connection = () => {
    const {
      order,
      currencies,
      orderInfo,
      amounts
    } = convertOrderToTransactionObject(JSON.parse(this.state.searchAddress));
    const newOrder = this.createNewOrder(order, currencies, orderInfo, amounts);
    this.setState({
      order: newOrder,
      currencies,
      loading: false,
      initialFetched: true,
      failed: false,
      modalStep: 6,
    }, () => {
      this.updateImages();
      this.showModal();
      // this.updateShortenImageUrl();
    });
  }

  createNewOrder = (order, currencies, orderInfo, amounts) => {
    const tokenIds = {
      maker: null,
      taker: null
    };
    if (currencies.maker && currencies.maker.tokenId) {
      tokenIds.maker = currencies.maker.tokenId;
    }

    if (currencies.taker && currencies.taker.tokenId) {
      tokenIds.taker = currencies.taker.tokenId;
    }
    const newOrder = {
      entities: {
        maker: {
          currency: currencies.maker,
          address: order.makerAddress,
          amount: amounts.maker,
          tokenId: tokenIds.maker,
        },

        taker: {
          currency: currencies.taker,
          address: order.takerAddress,
          amount: amounts.taker,
          tokenId: tokenIds.taker,
        } 
      },
      actualOrder: order,
      orderInfo: orderInfo,
      isUserTaker: order.takerAddress === NULL_ADDRESS ? this.props.meta.userAddress !== order.makerAddress : this.props.meta.userAddress === order.takerAddress,
      isUserMaker: this.props.meta.userAddress === order.makerAddress
    };
    if (orderInfo.orderTakerAssetFilledAmount) {
      newOrder.takerCanFill = orderInfo.orderTakerAssetFilledAmount.comparedTo(order.takerAssetAmount) === -1;
    } else {
      newOrder.takerCanFill = true;
    }
    return newOrder;
  };

  updateImageFromApi = (whose, entity) => {
    const type = entity.currency.type;

    if (!TOKEN_IMAGES[type]) {
      TOKEN_IMAGES[type] = {};
    }

    if (TOKEN_IMAGES[type][entity.tokenId]) {
      const innerImages = this.state.innerImages;
      innerImages[whose] = TOKEN_IMAGES[type][entity.tokenId];
      this.setState({
        innerImages
      });
    } else {
      axios.get(`${entity.currency.ApiUrl}${entity.tokenId}`)
        .then(response => {
          const {
            data
          } = response;
          TOKEN_IMAGES[type][entity.tokenId] = data[entity.currency.imageApiField];
          const innerImages = this.state.images;
          innerImages[whose] = TOKEN_IMAGES[type][entity.tokenId];
          this.setState({
            innerImages
          });
        })
        .catch(err => {
          debugger;
        });
    }
  };

  updateShortenImageUrl = () => {
    const entities = this.state.order.entities;
    const title = ModalCommonStrings.SOCIAL(entities.taker.amount, entities.taker.currency.symbol, entities.maker.amount, entities.maker.currency.symbol);
    const long = "https://blockswap.co/status/" + this.state.searchAddress ;
    axios.post('https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyD-Och1uY5U4lVxmczoxPuPbnM2YJVX7qQ', {
        "dynamicLinkInfo": {
          "dynamicLinkDomain": "bswap.page.link",
          "link": long,
          "socialMetaTagInfo": {
            "socialTitle": title, 
            "socialDescription": ModalCommonStrings.SOCIALDESCRIPTION,
            "socialImageLink": "https://firebasestorage.googleapis.com/v0/b/blockswap-46c8d.appspot.com/o/img%2Ftokens%2Fbswap.png?alt=media&token=d69ba496-40e7-4701-a8b0-e8f2b56eeef5", 
          },
        },
        "suffix": {
          "option": "SHORT"
        }
      })
      .then(response => {
        this.setState({
            shortUrl: response.data.shortLink
          });
        
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  updateImages = () => {
    const order = this.getOrder();

    const empty = {
      maker: PINK_BOX_EMPTY_IMG,
      taker: PURPLE_BOX_EMPTY_IMG,
    }

    const filled = {
      maker: PINK_BOX_EMPTY_IMG,
      taker: PURPLE_BOX_EMPTY_IMG,
    }

    if (!order) {
      return empty;
    }
    const images = {
      maker: filled.maker,
      taker: order.orderInfo.orderStatus === 5 ? filled.taker : empty.taker,
    };
    this.setState({images});
    const innerImages = {
      maker: "../img/tokenImages/" + order.entities.maker.currency.image_file,
      taker: "../img/tokenImages/" + order.entities.taker.currency.image_file,
    };
    this.setState({
      innerImages
    }, () => {
      if (order.entities.maker.currency && order.entities.maker.currency.type.indexOf('erc721') === 0) {
        this.updateImageFromApi('maker', order.entities.maker);
      }
  
      if (order.entities.taker.currency && order.entities.taker.currency.type.indexOf('erc721') === 0) {
        this.updateImageFromApi('taker', order.entities.taker);
      }
    });
  }

  getOrder = _ => this.state.order;

  getList = index => {
    const order = this.getOrder();
    const entity = order.entities[index];
    const addressField = `${index}Address`;
    return <React.Fragment>
        <div className="row">
          <div className="col-2 h-pad-none">{Strings.FIELDS.tokenAddress}</div>
          <div className="col-10 pl-3 pr-0 ellipsis">
            : <a href={"https://www.etherscan.io/token/" + entity.currency.address} target="_blank">
            {entity.currency ? entity.currency.address : "Not supported"}
          </a>
          </div>
        </div>
        <div className="row">
          <div className="col-2 h-pad-none">{Strings.FIELDS.name}</div>
          <div className="col-10 pl-3 pr-0 ellipsis">
            : {entity.currency ? entity.currency.name : "Not supported"}
          </div>
        </div>
        <div className="row">
          <div className="col-2 h-pad-none">{Strings.FIELDS.symbol}</div>
          <div className="col-10 pl-3 pr-0e ellipsis">
            : {entity.currency ? entity.currency.symbol : "Not supported"}
          </div>
        </div>
        
        <div className="row">
          <div className="col-2 h-pad-none">{Strings.FIELDS[addressField]}</div>
          <div className="col-10 pl-3 pr-0 ellipsis">
            : {entity.address !== NULL_ADDRESS ? <a href={"https://www.etherscan.io/address/" + entity.address} target="_blank">{entity.address}</a> : 'Any'}
          </div>
        </div>

        {entity.amount && 
        <div className="row rect-row  text-truncate">
          <div className="col-2 h-pad-none">{Strings.FIELDS.amount}</div>
            <div className="col-10 pl-3 pr-0 ellipsis">
              : {entity.amount}
            </div>
          </div>}
        {entity.tokenId && <div className="row rect-row  text-truncate">
          <div className="col-2 h-pad-none">{Strings.FIELDS.tokenId}</div>
            <div className="col-10 pl-3 pr-0 ellipsis">
              : {entity.tokenId}
            </div>
          </div>}
      </React.Fragment>;
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

    if (this.state.modalStep === 4) {
      window.location.reload();
    }

  }

  getModalContents = (step = 1) => {
    const {
      order,
      currencies,
      filledOrderHash,
      cancelledHash,
      approvalHash,
      images,
      innerImages,
      shortUrl
    } = this.state;
    switch (step) {
      case 1: {
        return {
          modalType: "modalStandard",
          headingText: ModalCommonStrings.UNLOCK,
          headingSVG: LOCK_SVG,
          text: (approvalHash ? "Transaction Hash:" : ModalStrings[currencies.taker.type][step].TIME),
          linkText: (approvalHash),
          linkURL: "https://etherscan.io/tx/" + approvalHash,
          onCTA: this.approve,
          ctaText: ModalStrings[currencies.taker.type][step].APPROVE(currencies.taker.symbol)
        };

      }

      case 2: {
        return {
          modalType: "modalStandard",
          tradeHeading: {takerSymbol: currencies.taker.symbol, makerSymbol: currencies.maker.symbol, innerImages: [innerImages.maker, innerImages.taker], images: [images.maker, images.taker], arrowsSVG: ARROWS_SVG, amounts: [nFormatter(order.entities.maker.amount), nFormatter(order.entities.taker.amount)]},
          text: filledOrderHash ? "Transaction Hash:" : ModalStrings[currencies.taker.type][step].TIME,
          linkText: filledOrderHash,
          linkURL: "https://etherscan.io/tx/" + filledOrderHash,
          onCTA: this.fill,
          ctaText: ModalStrings[currencies.taker.type][step].FILL(currencies.taker.symbol, nFormatter(order.entities.taker.amount), currencies.maker.symbol, nFormatter(order.entities.maker.amount)),
        };
      }

      case 3: {
        return {
          modalType: "modalStandard",
          headingText: ModalCommonStrings.CANCEL,
          headingSVG: CANCEL_POPUP_SVG,
          text: cancelledHash ? "Transaction Hash:" : ModalStrings[currencies.taker.type][step].TIME,
          linkText: cancelledHash,
          linkURL: "https://etherscan.io/tx/" + cancelledHash,
          onCTA: this.cancel,
          ctaText: ModalStrings[currencies.taker.type][step].CANCEL(currencies.taker.symbol, nFormatter(order.entities.taker.amount), currencies.maker.symbol, nFormatter(order.entities.maker.amount))
        };
      }

      case 4: {
        if (cancelledHash) {
          return {
          modalType: "modalStandard",
            headingText: ModalCommonStrings.CANCELSUCCESS,
            headingSVG: SUCCESS_POPUP_SVG,
            text: "Transaction Hash: ",
            linkText: cancelledHash,
            linkURL: "https://etherscan.io/tx/" + cancelledHash,
           };
        } else if (filledOrderHash) {
          return {
          modalType: "modalStandard",
            headingText: ModalCommonStrings.FILLSUCCESS,
            headingSVG: SUCCESS_POPUP_SVG,
            text: "Transaction Hash: ",
            linkText: filledOrderHash,
            linkURL: "https://etherscan.io/tx/" + filledOrderHash,
           };
        }
        return {
          modalType: "modalStandard",
          headingText: ModalCommonStrings.SUCCESS,
          headingSVG: SUCCESS_POPUP_SVG,
          text: "",
          linkText: "",
          linkURL: "",
         };

      }

      case 5: {
        return {
          modalType: "modalShare",
          orderJSON: JSON.stringify(order.actualOrder, undefined, 4),
          orderStatusUrl: shortUrl
        }
      }

      case 6: {
        return {
          modalType: "modalStandard",
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

  approve = () => {
    this.setState({
      loading: true,
      error: false,
      metamaskPending: true,
      pending: false
    });

    const {
      order,
      currencies
    } = this.state;
    grantUnlimitedAllowance({
      tokenAddress: order.entities.taker.currency.address,
      tokenType: currencies.taker.type,
      tokenId: currencies.taker.tokenId,
    })
    .then(hash => {
        this.setState({
          approvalHash: hash,
          pending: true,
          metamaskPending: false
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

  fill = () => {
    this.setState({
      metamaskPending: true,
      pending: false,
      loading: true,
      error: false
    });
    const {
      order,
    } = this.state;
    fillOrder({
      fillTakerTokenAmount: order.actualOrder.takerAssetAmount.minus(order.orderInfo.orderTakerAssetFilledAmount),
      signedOrder: order.actualOrder
    })
      .then(hash => {
        this.setState({
          filledOrderHash: hash,
          pending: true,
          metamaskPending: false
        });

        return waitForOrderMining({
          hash
        })
      })
      .then(receipt => {
        this.setState({
          metamaskPending: false,
          pending: false,
          loading: false,
          modalStep: 4
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
      });
  }

  cancel = () => {
    this.setState({
      metamaskPending: true,
      pending: false,
      loading: true,
      error: false
    });
    const {
      order,
    } = this.state;
    cancelOrder({
      order: order.actualOrder
    })
      .then(hash => {
        this.setState({
          cancelledHash: hash,
          pending: true,
          metamaskPending: false
        });

        return waitForOrderMining({
          hash
        })
      })
      .then(receipt => {
        this.setState({
          metamaskPending: false,
          pending: false,
          loading: false,
          modalStep: 4
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
      });
  }

  shareModal = event => {
    event.preventDefault();

    this.setState({
      loading: true,
      error: false
    });

      this.setState({
        modalStep: 5
      }, () => {
        this.showModal();
      })
  }

  cancelModal = event => {
    event.preventDefault();

    this.setState({
      loading: true,
      error: false
    });

      this.setState({
        modalStep: 3
      }, () => {
        this.showModal();
      })
  }

  check = event => {
    event.preventDefault();
    if (!getUserAddr()) {
      this.setState({
        modalStep: 6
      }, () => {
        this.showModal();
      })
      return;
    }
    this.setState({
      loading: true,
      error: false
    });

    const {
      order,
      currencies
    } = this.state;
    isTokenAllowanceSufficient({
      tokenAddress: order.entities.taker.currency.address,
      tokenAmount: order.entities.taker.amount,
      tokenType: currencies.taker.type,
      tokenId: currencies.taker.tokenId,
    })
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
      .catch(() => {
        this.setState({
            metamaskPending: false,
            pending:false,
            loading: false,
            error: true
          });
      });
  }

  render() {
    if (this.state.toStatus) {
      return <Redirect to={{
        pathname: `/status/${this.state.searchAddress}`
      }} />
    }
    
    const order = this.state.order || {};

    const orderInfo = order.orderInfo || {};
    const {
      takerCanFill,
      isUserTaker,
      isUserMaker,
      isValid,
    } = order;

    const {
      initialFetched,
      failed,
      modalShown,
      modalStep,
      loading,
      error,
      images,
      innerImages,
      pending,
      metamaskPending
    } = this.state;
    const isOrderCancelled = orderInfo.orderStatus === 6;

    let status = "";
    switch(orderInfo.orderStatus)
    {
      case 0:
        status = Strings.STATUSES.INVALID;
        break;
      case 1:
        status = Strings.STATUSES.INVALID_MAKER_ASSET_AMOUNT;
        break;
      case 2:
        status = Strings.STATUSES.INVALID_TAKER_ASSET_AMOUNT;
        break;
      case 3:
        status = Strings.STATUSES.FILLABLE;
        break;
      case 4:
        status = Strings.STATUSES.EXPIRED;
        break;
      case 5:
        status = Strings.STATUSES.FULLY_FILLED;
        break;
      case 6:
        status = Strings.STATUSES.CANCELLED;
        break;
      default:
        status = Strings.STATUSES.UNKNOWN;
    }
    let expiration = order.actualOrder ?
      moment(order.actualOrder.expirationTimeSeconds*1000).fromNow() : '';
      expiration = expiration ? "expires " + expiration : '';
    

    let searchAddress = this.props.match.params.searchAddress;
    let toShow;
    
    if (initialFetched) {
      if (failed) {
        toShow = (
          <div className="row text-center">
            <div className="col-12">
              <p className="text-danger">{Strings.FAILED}</p>
            </div>
          </div>
        )
      } else {
        let modalContents = this.getModalContents(modalStep);
        let modalBody;
        switch(modalContents.modalType) {
          case "modalStandard":
            modalBody = 
            <Modal centered={true} className="modalStandard" isOpen={this.state.modalShown} toggle={this.toggleModal} >
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
              />
              </Modal>;
            break;
          case "modalShare":
            modalBody = 
            <Modal centered={true} className="modal-share" isOpen={this.state.modalShown} toggle={this.toggleModal} >
              <ModalShareBody
                orderJSON={modalContents.orderJSON}
                orderStatusUrl={modalContents.orderStatusUrl}
                onClose={this.hideModal}
              />
            </Modal>;
            break;
        }
        debugger;
        toShow = (
          <React.Fragment>
            <div className="text-center status-container">
              <div className="d-inline-block">
                <div className="row d-none d-md-block text-center box-d">
                  <div className="col-12">
                    <div className="d-inline-block position-relative">
                      <img className="img-fluid" style={{maxWidth: '100px'}} src={images.taker} />
                      <img className="img-fluid position-absolute" style={{width: '44px', height: '44px', top: '35px', right: '36px'}}  src={innerImages.taker} />
                    </div>
                    <ReactSVG src={ARROWS_SVG} svgStyle={{maxWidth: '82px', maxHeight: '72px'}} />
                    <div className="d-inline-block position-relative">
                      <img className="img-fluid" style={{maxWidth: '100px'}} src={images.maker} />
                      <img className="img-fluid position-absolute" style={{width: '44px', height: '44px', top: '35px', right: '36px'}}  src={innerImages.maker} />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div style={{margin: '16px 8px'}} className="col-12 d-md-none text-center">
                    <div className="d-inline-block position-relative">
                      <img className="img-fluid" style={{maxWidth: '100px'}} src={images.taker} />
                      <img className="img-fluid position-absolute" style={{width: '44px', height: '44px', top: '35px', right: '36px'}}  src={innerImages.taker} />
                    </div>
                  </div>

                  <div className="trade-rectangle marg-center marg-right-md">
                    <h4 className="text-uppercase">{Strings.SEND}</h4>
                    {this.getList('taker')}
                  </div>
                  
                  <div className="col-12 d-md-none text-center">
                    <ReactSVG src={ARROWS_SVG} svgClassName="Illustration Rotated pl-4" svgStyle={{ maxHeight: '64px' }}/>
                  </div>
                  <div style={{margin: '16px 8px'}} className="col-12 d-md-none text-center">
                    <div className="d-inline-block position-relative">
                      <img className="img-fluid" style={{maxWidth: '100px'}} src={images.maker} />
                      <img className="img-fluid position-absolute" style={{width: '44px', height: '44px', top: '35px', right: '36px'}}  src={innerImages.maker} />
                    </div>
                  </div>
                  
                  <div className="trade-rectangle marg-center">
                    <h4 className="text-uppercase">{Strings.RECEIVE}</h4>
                    {this.getList('maker')}
                  </div>
                
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-12 text-center">
                <div className="m-auto d-inline-block bottom-buttons">
                  {isUserTaker && takerCanFill && !isOrderCancelled && (
                    <button type="button" className={`btn btn-primary text-uppercase ${loading ? 'btn-disable' : ''}`} disabled={loading} onClick={this.check}>{Strings.BUTTONS.FILL}</button>
                  )}
                  {isUserMaker && !isOrderCancelled && (
                    <div>
                    <button type="button" className={`btn btn-secondary text-uppercase ${loading ? 'btn-disable' : ''}`} disabled={loading} onClick={this.cancelModal}>{Strings.BUTTONS.CANCEL}</button>
                    <button type="button" className={`btn btn-primary ml-4 text-uppercase ${loading ? 'btn-disable' : ''}`} disabled={loading} onClick={this.shareModal}>{Strings.BUTTONS.SHARE}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="row mt-2">
                <div className="col-12 col-md-6 col-lg-6">
                  {error && (
                    <p className="text-danger">{Strings.ERROR}</p>
                  )}
                </div>
              </div>
            </div>
            {modalBody}
          </React.Fragment>
        );
      }
    }

    return <div className="Status">
      <div className="Banner" style={{background: `url(${LEFTBACK_SVG}) left bottom no-repeat`}}>
        <div className="d-flex h-100 align-items-center justify-content-center" style={{background: `url(${RIGHTBACK_SVG}) right bottom no-repeat`}}>
          <h1>{Strings.HEADING}</h1>
          <span>{Strings.SUBHEADING}</span>
        </div>
      </div>
      <div className="BannerBelow" >
        <div className="row pt-3">
          <div className="col-md-1 col-sm-2 offset-md-2 offset-sm-1">
            <span className="header-descriptor">{Strings.ORDER}:</span>
          </div>
           <div className="col-md-7 col-sm-8">
            <span>{this.state.searchAddress}</span>
          </div>
        </div>
        <div className="row pt-2">
          <div className="col-md-1 col-sm-2 offset-md-2 offset-sm-1">
            <span className="header-descriptor">{Strings.STATUS}:</span>
          </div>
           <div className="col-md-7 col-sm-8">
            <span>{status} &nbsp; • &nbsp; {expiration}</span>
          </div>
        </div>
      </div>
      <div className="ContentArea">
        <div className="row-container">
          {this.state.initialFetched
          ? toShow
          : (
            <div className="row text-center">
              <div className="col-12">
                <Loader type="Circles" color="#DD3BAD" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>;
  }
}

export default withRouter(Status);
