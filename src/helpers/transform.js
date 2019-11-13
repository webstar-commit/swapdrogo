/**
 * Transforms contract data into data usable by frontend.
 * @param {Object} contractData 
 * 
 * @return {Object}
 */
export const transformFromContractData = contractData => {
  return [
    {
      amount: contractData.amountFirstTraderSending,
      tokenAddress: contractData.tokenFirstTraderSending,
      makerAddress: contractData.firstTrader
    },

    {
      amount: contractData.amountSecondTraderMustSend,
      tokenAddress: contractData.tokenSecondTraderMustSend,
      takerAddress: contractData.secondTrader
    }
  ];
}

/**
 * Transforms data from frontend to contract data.
 * @param {Object} formData 
 * 
 * @return {Object}
 */
export const transformToContractData = formData => {
  return {
    amountFirstTraderSending: formData[0].amount,
    tokenFirstTraderSending: formData[0].tokenAddress,
    firstTrader: formData[0].makerAddress,

    amountSecondTraderMustSend: formData[1].amount,
    tokenSecondTraderMustSend: formData[1].tokenAddress,
    secondTrader: formData[1].takerAddress
  }
}