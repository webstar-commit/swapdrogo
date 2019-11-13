const Strings = {
  en: {

    Tagline: {
      TAGLINE: 'An over the counter method for trading your digital assets. Choose your own terms and counterparty. Proudly built on',
      EMAIL: 'Email Support',
      DONATIONS: 'Donations are appreciated!',
      HELP: 'FAQ'
    },

    Navbar: {
      PLACEHOLDER: 'Search by Order JSON',
    },

    Trade: {
      HEADING: 'Create a New Swap',
      SUBHEADING: 'Create an over-the-counter trade on your terms',
      SELLING: 'Selling',
      BUYING: 'Buying',

      BUTTONBAR: {
        expirationButton: 'Expiration',
        instantButton: 'Instant',
        moreButton: 'More Filters',
        instantButtonTip: 'Coming Soon'
      },

      FIELDS: {
        amount: {
          name: 'Amount'
        },

        makerAddress: {
          name: 'Maker Address',
          help: 'A maker address belongs to the account generating the trade.'
        },

        takerAddress: {
          name: 'Taker Address',
          help: 'A taker address belongs to the account filling the trade.',
          asteriksMessage: '*optional'
        },

        tokenAddress: {
          name: 'Token Address',
          help: 'This token address will be used to determine which token can be swapped in the trade.'
        },

        tokenId: {
          name: 'ID'
        }
      },

      CTA: 'CREATE & SIGN ORDER',

      LOADING: 'Please wait..',

      ERROR: 'Oops, something went wrong.'
    },

    Status: {
      HEADING: 'Swap Status',
      SUBHEADING: 'View and interact with an over-the-counter trade',

      SEND: 'Send',
      RECEIVE: 'Receive',
      ORDER: 'Order',
      STATUS: 'Status',
      STATUSES: {
        READY: 'Ready for finalization',
        PENDING: 'Pending deposits',
        INVALID: 'Invalid Order',
        INVALID_MAKER_ASSET_AMOUNT: 'Invalid Maker Amount',
        INVALID_TAKER_ASSET_AMOUNT: 'Invalid Taker Amount',
        FILLABLE: 'Ready for fill',
        EXPIRED: 'Order Expired',
        FULLY_FILLED: 'Order Completely Filled',
        CANCELLED: 'Order Cancelled',
        UNKNOWN: 'Unknown'
      },
      FIELDS: {
        tokenAddress: 'Token',
        name: 'Name',
        symbol: 'Symbol',
        amount: 'Amount',
        balance: 'Deposited',
        tokenId: 'Token ID',
        makerAddress: 'Maker',
        takerAddress: 'Taker'
      },
      BUTTONS: {
        WITHDRAW: 'Withdraw',
        SHARE: 'Share',
        DEPOSIT: 'Deposit',
        FINALIZE: 'Finalize',
        FILL: 'Fill',
        CANCEL: 'Cancel'
      },
      FAILED: 'Failed to get contract details. Please refresh.',
      LOADING: 'Please wait..',
      ERROR: 'Oops, something went wrong.'
    },
    ModalCommon: {
      UNLOCK: 'Unlock',
      SIGN: 'Sign',
      FILL: 'Fill',
      METAMASKCONFIRM: 'Please confirm on Metamask',
      MINING: 'Mining Transaction',
      CANCEL: 'Cancel',
      FILLSUCCESS: 'Fill Successful',
      CANCELSUCCESS: 'Cancel Successful',
      SOCIALDESCRIPTION: 'Blockswap is how people trade their digital assets on their own terms. Now come check out this swap!',
      SOCIAL: (a0, s0, a1, s1) => `Trade ${a0} ${s0} for ${a1} ${s1}`
    },
    MetamaskModal: {
      TITLE: "Please login to Metamask",
      DESCRIPTION: "Our gateway to the Ethereum blockchain",
      LINKTEXT: "Don\'t have Metamask?",
    },
    ShareModal: {
      TITLE: 'Order JSON',
      DESCRIPTION: 'You generated and signed an order! The following JSON contains the necessary order parameters and signature your counterparty needs to fill the order.',
      YOURORDER: 'Your Order JSON',
      SHARE: 'Share it with the provided url'
    },
    Modal: {
      erc20: {
        1: {
          TIME: 'To swap, tokens must be unlocked.',
          CHANGE: 'Change',
          APPROVE: symbol => `Approve ${symbol} for Trading`
        },
        2: {
          TIME: 'By signing, you agree to the terms of this swap.',
          CHANGE: 'Change',
          SIGN: (s0, a0, s1, a1) => `Sign ${a0} ${s0} for ${a1} ${s1}`
        }
      },
      erc721: {
        1: {
          TIME: 'In order to swap, you must first unlock your tokens.',
          CHANGE: 'Change',
          APPROVE: symbol => `Approve ${symbol} for Trading`
        },
        2: {
          TIME: 'By signing, you agree to the terms of this swap',
          CHANGE: 'Change',
          SIGN: (s0, a0, s1, a1) => `Sign ${s0} #${a0} for ${a1} ${s1}`
        }
      },
      erc721ck: {
        1: {
          TIME: 'In order to swap, you must first unlock your tokens.',
          CHANGE: 'Change',
          APPROVE: symbol => `Approve ${symbol} for Trading`
        },
        2: {
          TIME: 'By signing, you agree to the terms of this swap',
          CHANGE: 'Change',
          SIGN: (s0, a0, s1, a1) => `Sign ${s0} #${a0} for ${a1} ${s1}`
        }
      }
    },
    TakerModal: {
      erc20: {
        1: {
          TIME: 'To swap, tokens must be unlocked.',
          CHANGE: 'Change',
          APPROVE: symbol => `Approve ${symbol} for Trading`
        },
        2: {
          TIME: 'By signing, you agree to the terms of this swap.',
          CHANGE: 'Change',
          FILL: (s0, a0, s1, a1) => `Fill ${a0} ${s0} for ${a1} ${s1}`
        },
        3: {
          TIME: 'Cancel to stop accepting fills for this contract.',
          CHANGE: 'Change',
          CANCEL: (s0, a0, s1, a1) => `Cancel ${a0} ${s0} for ${a1} ${s1}`
        }
      },
      erc721: {
        1: {
          TIME: 'In order to swap, you must first unlock your tokens.',
          CHANGE: 'Change',
          APPROVE: symbol => `Approve ${symbol} for Trading`
        },
        2: {
          TIME: 'By signing, you agree to the terms of this swap.',
          CHANGE: 'Change',
          FILL: (s0, a0, s1, a1) => `Fill ${a0} ${s0} for ${a1} ${s1}`
        },
        3: {
          TIME: 'Cancel to stop accepting fills for this contract.',
          CHANGE: 'Change',
          CANCEL: (s0, a0, s1, a1) => `Cancel ${a0} ${s0} for ${a1} ${s1}`
        }
      },
      erc721ck: {
        1: {
          TIME: 'In order to swap, you must first unlock your tokens.',
          CHANGE: 'Change',
          APPROVE: symbol => `Approve ${symbol} for Trading`
        },
        2: {
          TIME: 'By signing, you agree to the terms of this swap.',
          CHANGE: 'Change',
          FILL: (s0, a0, s1, a1) => `Fill ${a0} ${s0} for ${a1} ${s1}`
        },
        3: {
          TIME: 'Cancel to stop accepting fills for this contract.',
          CHANGE: 'Change',
          CANCEL: (s0, a0, s1, a1) => `Cancel ${a0} ${s0} for ${a1} ${s1}`
        }
      }
    },

    My: {
      ERROR: 'Failed to retrieve orders.',
      INVALID_ORDER: 'Invalid order.',
      PENDING_ORDER: 'Pending',
      COMPLETE_ORDER: 'Complete',
      ARCHIVE: 'Archive',
      UNARCHIVE: 'Unarchive',
      ORDER_HASH: 'Order Hash',
      OTHER_TRADER: 'Other Trader',
      EMPTY_LIST: "There's nothing here."
    }
  }
};

Strings.es = Strings.en;

export default Strings;