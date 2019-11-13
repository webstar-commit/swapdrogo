
import { 
  BigNumber,
  constants,
  ContractWrappers,
  assetDataUtils,
  signatureUtils,
  orderHashUtils,
  generatePseudoRandomSalt,
  ECSignature, 
  SignatureType, 
  SignerType, 
  ValidatorSignature,
  MetamaskSubprovider
} from '0x.js';

import {ERC721CKContractInfo} from '../constants/erc721ck';
import {currenciesJSON} from '../constants/currencies1';
import {Web3Wrapper} from '@0x/web3-wrapper';

const Eth = require('ethjs');

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

let provider; 
let contractWrappers;
let eth;
let web3Wrapper;
let gasPrice = new BigNumber(6000000000);
let currenciesList;
let networkId;
const web3 = window.web3;
if (web3) {
  provider = (web3.currentProvider).isMetaMask
                    ? new MetamaskSubprovider(window.web3.currentProvider)
                    : window.web3.currentProvider;

  eth = new Eth(provider);
  web3Wrapper = new Web3Wrapper(provider);
  window.web3.version.getNetwork(function (err, networkId) {
    if (!err) {
      networkId = parseInt(networkId, 10);
      currenciesList = currenciesJSON[networkId];
      contractWrappers = new ContractWrappers(provider, { networkId: networkId });
    } else {
      networkId = "1";
      currenciesList = currenciesJSON[networkId];
      contractWrappers = new ContractWrappers(provider, { networkId: networkId });
      console.log('Problem while getting network.');
    }
  });
} else {
  networkId = "1";
  currenciesList = currenciesJSON[networkId];
  console.log('No web3');
}


const FEE_ADDR = '';

export const getUserAddr = () => {
  if (window.web3) {
    return window.web3.eth.accounts[0];
  }
}

/**
 * Says whether or not allowance is sufficient.
 * @param {String} tokenAddress
 * @param {String} makerAddress
 * 
 * @return {Promise<Boolean>}
 */
export const isTokenAllowanceSufficient = ({ tokenAddress, tokenType, tokenAmount = 1, tokenId = null }) => new Promise((resolve, reject) => {
  tokenAmount = new BigNumber(tokenAmount);
  const from = getUserAddr();
  const erc721ContractAddress = contractWrappers
        .erc721Proxy.address;
  switch(tokenType) {
    case "erc20":
      contractWrappers
        .erc20Token
        .getProxyAllowanceAsync(tokenAddress, from)
        .then(amount => resolve(amount.comparedTo(tokenAmount) >= 0))
        .catch(err => reject(err));
      break;
    case "erc721ck":
      var token = eth.contract(ERC721CKContractInfo.abi).at(ERC721CKContractInfo.address);
      var result = token.kittyIndexToApproved(tokenId).then(result => {
        resolve(result[0] === erc721ContractAddress)
      }).catch(err => {
          debugger;
          reject(err);
      });
      break;
    case "erc721":
      contractWrappers
        .erc721Token
        .isApprovedForAllAsync(tokenAddress, from, erc721ContractAddress)
        .then(isApprovedForAllAsync => resolve(isApprovedForAllAsync))
        .catch(err => {
          debugger;
          reject(err);
        });
      break;
    default:
      throw new Error({'error':'no token type in isTokenAllowanceSufficient'});
  }
});

/**
 * Grants unlimited allowance.
 * @param {String} tokenAddress
 * @param {String} makerAddress
 * 
 * @return {Promise<TransactionReceiptWithDecodedLogs>}
 */
export const grantUnlimitedAllowance = ({ tokenAddress, tokenType, tokenId = null  }) => new Promise((resolve, reject) => {
  const from = getUserAddr();
  switch(tokenType) {
    case "erc20":
      contractWrappers
      .erc20Token
      .setUnlimitedProxyAllowanceAsync(tokenAddress, from, {
        gasPrice: gasPrice
      })
      .then(hash => resolve(hash))
      .catch(err => {
        debugger;
        reject(err);
      });
      break;
    case "erc721ck":
      const erc721ContractAddress = contractWrappers.erc721Proxy.getContractAddress();
      var token = eth.contract(ERC721CKContractInfo.abi).at(ERC721CKContractInfo.address);

      token.approve(erc721ContractAddress, tokenId, {from: from, gas: 69423})
      .then(hash => resolve(hash))
      .catch(error => {
        debugger;
        reject(error);
      });
      break;
    case "erc721":
      contractWrappers
      .erc721Token
      .setProxyApprovalForAllAsync(tokenAddress, from, true, {
        gasPrice: gasPrice
      })
      .then(hash => resolve(hash))
      .catch(err => {
          debugger;
          reject(err);
        });
      break;
    default:
      throw new Error({'error':'no token type in grantUnlimitedAllowance'});
  }
  
});

/**
 * Creates Asset Data
 * @param {String} tokenAddress
 * @param {String} tokentype
 * @param {BigNumber} tokenId
 * 
 * @return String
 */
export const createAssetData = ({tokenAddress, tokenType, tokenId = null}) => {
  switch(tokenType) {
    case "erc20":
      return assetDataUtils.encodeERC20AssetData(tokenAddress);
    case "erc721ck":
    case "erc721":
      tokenId = new BigNumber(tokenId);
      return assetDataUtils.encodeERC721AssetData(tokenAddress, tokenId);
    default:
      throw new Error({'error':'no token type in createAssetData'});
  }
}

export const nFormatter = (num) => {
  if (!num) {
    return '';
  }
  const digits = 1;
  var si = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "k" },
    { value: 1E6, symbol: "M" },
    { value: 1E9, symbol: "G" },
    { value: 1E12, symbol: "T" },
    { value: 1E15, symbol: "P" },
    { value: 1E18, symbol: "E" }
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}


/**
 * Creates order, signs it
 * @param {String} makerAddress
 * @param {String} takerAddress
 * @param {String} makerTokenAddress
 * @param {String} takerTokenAddress
 * @param {Number} makerTokenAmount
 * @param {Number} takerTokenAmount
 * @param {Array<Object>} currencies
 * 
 * @return Promise<Order>
 */
export const createAndSignOrder = ({
  makerAddress,
  takerAddress,
  makerAssetData,
  takerAssetData,
  makerTokenAmount,
  takerTokenAmount,
  currencies,
  expirationTimeSeconds
}) => new Promise((resolve, reject) => {
    const exchangeAddress = contractWrappers.exchange.address;
    const salt = generatePseudoRandomSalt();
    var makerAssetAmount;
    if (makerTokenAmount) {
      makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(makerTokenAmount), currencies[0].decimals);
    } else {
      makerAssetAmount = new BigNumber(1);
      makerTokenAmount = 1;
    }
    var takerAssetAmount;
    if (takerTokenAmount) {
      takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(takerTokenAmount), currencies[1].decimals);
    } else {
      takerAssetAmount = new BigNumber(1);
      takerTokenAmount = 1;
    }
    // Create the order
    const order = {
            makerAddress,
            takerAddress,
            makerFee: new BigNumber(0),
            takerFee: new BigNumber(0),
            senderAddress: NULL_ADDRESS,
            makerAssetAmount,
            takerAssetAmount,
            makerAssetData,
            takerAssetData,
            exchangeAddress,
            feeRecipientAddress: NULL_ADDRESS,
            salt: salt,
            expirationTimeSeconds:
                new BigNumber(expirationTimeSeconds),
        };
    
    // Create orderHash
    const orderHash = orderHashUtils.getOrderHashHex(order);
    // Signing orderHash -> ecSignature
    signatureUtils.ecSignOrderAsync(provider, order, makerAddress)
      // .ecSignOrderHashAsync(provider, orderHash, makerAddress, SignerType.Metamask)
      .then(signedOrder => {
        resolve(signedOrder);
      })
      .catch(err => { 
        debugger;
        reject(err)
      })
});

/**
 * Retrieves an order object with BigNumbers converted.
 * @param {Order} order
 * 
 * @return {Promise<Order, Currencies>}
 */
const convertOrderBigNumber = _order => {
  const order = {
    ..._order
  };

  const bigNumbers = ["makerFee","takerFee","makerAssetAmount","takerAssetAmount","salt","expirationTimeSeconds"];

  bigNumbers.forEach(key => {
    order[key] = new BigNumber(order[key]);
  })

  delete order.bigNumbers;
  return order;
}


export const convertOrderToTransactionObject = signedOrder => {
  let makerAssetData = assetDataUtils.decodeAssetDataOrThrow(signedOrder.makerAssetData);
  let takerAssetData = assetDataUtils.decodeAssetDataOrThrow(signedOrder.takerAssetData);
  let takerCurrency = currenciesList[takerAssetData.tokenAddress] ? currenciesList[takerAssetData.tokenAddress] : currenciesJSON["0"]["1"];
  let makerCurrency = currenciesList[makerAssetData.tokenAddress] ? currenciesList[makerAssetData.tokenAddress] : currenciesJSON["0"]["2"];
  let currencies = {taker: takerCurrency, maker: makerCurrency};
  if (makerAssetData.tokenId) {
    currencies.maker.tokenId = makerAssetData.tokenId/1;
  }
  if (takerAssetData.tokenId) {
    currencies.taker.tokenId = takerAssetData.tokenId/1;
  }
  let takerAssetAmount = signedOrder.takerAssetAmount/1;
  if (currencies.taker && currencies.taker.decimals) {
    takerAssetAmount = takerAssetAmount/Math.pow(10,currencies.taker.decimals);
  }
  let makerAssetAmount = signedOrder.makerAssetAmount/1;
  if (currencies.maker && currencies.maker.decimals) {
    makerAssetAmount = makerAssetAmount/Math.pow(10,currencies.maker.decimals);
  }
  let amounts = {taker: takerAssetAmount, maker: makerAssetAmount};
  return {
    order: {
      ...signedOrder,
    },
    currencies: currencies,
    orderInfo: {},
    amounts: amounts
  }
}

/**
 * Retrieves a complete order by order object.
 * @param {Order} order
 * 
 * @return {Promise<Order, Currencies>}
 */
export const getTransaction = ({ order }) => new Promise ((resolve, reject) => {

  const signedOrder = convertOrderBigNumber(order);
  const transactionObject = convertOrderToTransactionObject(signedOrder);
  contractWrappers.exchange
    .getOrderInfoAsync(signedOrder)
    .then(orderInfo => {
      transactionObject.orderInfo = orderInfo;
      resolve(transactionObject);

    })
    .catch(err => {
      debugger;
      reject(err);
    });
    
});

/**
 * Tries to fill an order.
 * @param {Object} signedOrder
 * @param {BigNumber} fillTakerTokenAmount,
 * @param {Boolean} shouldThrowOnInsufficientBalanceOrAllowance
 * @param {String} takerAddress
 * 
 * @return {Promise<Object>}
 */
export const fillOrder = ({ signedOrder, fillTakerTokenAmount, shouldThrowOnInsufficientBalanceOrAllowance = false }) => new Promise ((resolve, reject) => {
   const from = getUserAddr();
   contractWrappers.exchange
    .fillOrderAsync(signedOrder, fillTakerTokenAmount, from, {
    gasPrice: gasPrice,
  })
  .then(hash => resolve(hash))
  .catch(err => {
    debugger;
    reject(err);
  });
});

/**
 * Tries to cancel an order.
 * @param {Object} order
 * @return {Promise<Object>}
 */
export const cancelOrder = ({ order}) => new Promise ((resolve, reject) => {
   contractWrappers.exchange
    .cancelOrderAsync(order, {
    gasPrice: gasPrice,
  })
  .then(hash => resolve(hash))
  .catch(err => {
    debugger;
    reject(err);
  });
});

/**
 * Waits for order to complete mining.
 * @param {String} hash
 * 
 * @return {Promise<Receipt>}
 */
export const waitForOrderMining = ({ hash }) => new Promise((resolve, reject) => {
  web3Wrapper
    .awaitTransactionMinedAsync(hash)
    .then(receipt => resolve(receipt))
    .catch(err => reject(err));
})
