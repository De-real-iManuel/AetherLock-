const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Cross-Chain Escrow Flow', function () {
  let gateway, verifier, owner, client, freelancer;

  before(async function () {
    [owner, client, freelancer] = await ethers.getSigners();
    
    const Gateway = await ethers.getContractFactory('ZetaEscrowGateway');
    gateway = await Gateway.deploy(owner.address, owner.address);
    await gateway.deployed();

    const Verifier = await ethers.getContractFactory('ChainlinkVerifier');
    const donId = ethers.utils.formatBytes32String('test-don');
    verifier = await Verifier.deploy(owner.address, donId, 1, gateway.address);
    await verifier.deployed();
  });

  it('Should create escrow on ZetaChain', async function () {
    const amount = ethers.utils.parseEther('1.0');
    const tx = await gateway.connect(client).createEscrow(
      ethers.utils.toUtf8Bytes('solana_program_id'),
      client.address,
      freelancer.address,
      amount,
      'Build website',
      { value: amount }
    );

    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'EscrowCreated');
    expect(event).to.not.be.undefined;
  });

  it('Should request verification via Chainlink', async function () {
    const escrowId = ethers.utils.formatBytes32String('test-escrow');
    const tx = await verifier.requestVerification(
      'Build responsive website',
      'QmTest123',
      escrowId
    );

    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === 'VerificationRequested');
    expect(event).to.not.be.undefined;
  });

  it('Should handle cross-chain message', async function () {
    const escrowId = ethers.utils.formatBytes32String('test-escrow-2');
    await gateway.handleCrossChainCall(escrowId, true);
    
    const escrow = await gateway.escrows(escrowId);
    expect(escrow.status).to.equal(1);
  });
});
