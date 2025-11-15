const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    console.log("No deployer account found. Using default addresses for simulation.");
    console.log("\n=== Simulated Deployment ===");
    console.log("ZetaEscrowGateway: 0x1234567890123456789012345678901234567890");
    console.log("ChainlinkVerifier: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd");
    return;
  }
  console.log("Deploying with:", deployer.address);

  const gatewayAddress = process.env.ZETACHAIN_GATEWAY_ADDRESS || "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
  const routerAddress = process.env.CHAINLINK_FUNCTIONS_ROUTER || "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
  const subscriptionId = process.env.CHAINLINK_SUBSCRIPTION_ID || "1";
  const treasuryAddress = process.env.TREASURY_WALLET || deployer.address;
  const donId = hre.ethers.utils.formatBytes32String("fun-ethereum-sepolia-1");

  console.log("\nDeploying ZetaEscrowGateway...");
  const Gateway = await hre.ethers.getContractFactory("ZetaEscrowGateway");
  const gateway = await Gateway.deploy(gatewayAddress, treasuryAddress);
  await gateway.deployed();
  console.log("✅ ZetaEscrowGateway:", gateway.address);

  console.log("\nDeploying ChainlinkVerifier...");
  const Verifier = await hre.ethers.getContractFactory("ChainlinkVerifier");
  const verifier = await Verifier.deploy(routerAddress, donId, subscriptionId, gateway.address);
  await verifier.deployed();
  console.log("✅ ChainlinkVerifier:", verifier.address);

  console.log("\n=== Deployment Complete ===");
  console.log("ZetaEscrowGateway:", gateway.address);
  console.log("ChainlinkVerifier:", verifier.address);
  console.log("\nUpdate .env with:");
  console.log(`VITE_ZETACHAIN_GATEWAY_ADDRESS=${gateway.address}`);
  console.log(`CHAINLINK_VERIFIER_ADDRESS=${verifier.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
