require("@nomiclabs/hardhat-waffle");
require('solidity-coverage');
require("@atixlabs/hardhat-time-n-mine");
require("@nomiclabs/hardhat-etherscan");

// require('hardhat-contract-sizer');



/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const ROPSTEN_PRIVATE_KEY = "6bf12d117ec3faa0ab330891d827540d41e265b808b3676d1d111b2edf3b0997";
module.exports = {
  solidity: {
	version : "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
},
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/780d8b1fad934286adc4925b14c2358b`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
      
    },
  },
  etherscan: {
    apiKey: '1JMD1XNDHCE1SXRBYC3RPCE5AIJA487RUH',
  },
  // contractSizer: {
  //   alphaSort: true,
  //   runOnCompile: true,
  //   disambiguatePaths: false,
  // }
};


