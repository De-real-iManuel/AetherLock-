require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.ZETACHAIN_PRIVATE_KEY ? [process.env.ZETACHAIN_PRIVATE_KEY] : [],
      chainId: 11155111
    },
    zetachain: {
      url: process.env.ZETACHAIN_RPC_URL || "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      accounts: process.env.ZETACHAIN_PRIVATE_KEY ? [process.env.ZETACHAIN_PRIVATE_KEY] : [],
      chainId: 7001
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
