require("@nomicfoundation/hardhat-ethers");
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
    zetachain_testnet: {
      url: process.env.ZETACHAIN_RPC_URL || "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      accounts: process.env.ZETACHAIN_PRIVATE_KEY ? [process.env.ZETACHAIN_PRIVATE_KEY] : [],
      chainId: 7001
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
