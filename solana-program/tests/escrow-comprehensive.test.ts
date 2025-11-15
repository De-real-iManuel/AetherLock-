import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AetherlockEscrow } from "../target/types/aetherlock_escrow";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY 
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount
} from "@solana/spl-token";
import { expect } from "chai";
import * as ed25519 from "ed25519-hd-key";
import * as crypto from "crypto";

describe("AetherLock Escrow Comprehensive Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AetherlockEscrow as Program<AetherlockEscrow>;
  
  let mint: PublicKey;
  let buyer: Keypair;
  let seller: Keypair;
  let admin: Keypair;
  let aiAgent: Keypair;
  let buyerTokenAccount: PublicKey;
  let sellerTokenAccount: PublicKey;
  let protocolTreasury: PublicKey;
  
  const escrowId = crypto.randomBytes(32);
  const amount = new anchor.BN(1000000); // 1 token
  const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const metadataHash = crypto.randomBytes(32);

  before(async () => {
    // Initialize keypairs
    buyer = Keypair.generate();
    seller = Keypair.generate();
    admin = Keypair.generate();
    aiAgent = Keypair.generate();

    // Airdrop SOL
    await Promise.all([
      provider.connection.requestAirdrop(buyer.publicKey, 2e9),
      provider.connection.requestAirdrop(seller.publicKey, 2e9),
      provider.connection.requestAirdrop(admin.publicKey, 2e9)
    ]);

    // Create mint
    mint = await createMint(
      provider.connection,
      buyer,
      buyer.publicKey,
      null,
      6
    );

    // Create token accounts
    buyerTokenAccount = await createAccount(
      provider.connection,
      buyer,
      mint,
      buyer.publicKey
    );

    sellerTokenAccount = await createAccount(
      provider.connection,
      seller,
      mint,
      seller.publicKey
    );

    protocolTreasury = await createAccount(
      provider.connection,
      buyer,
      mint,
      buyer.publicKey
    );

    // Mint tokens to buyer
    await mintTo(
      provider.connection,
      buyer,
      mint,
      buyerTokenAccount,
      buyer,
      2000000
    );
  });

  describe("Protocol Configuration", () => {
    it("Should initialize protocol config", async () => {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      await program.methods
        .initializeConfig([admin.publicKey])
        .accounts({
          authority: buyer.publicKey,
          config: configPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      const config = await program.account.protocolConfig.fetch(configPda);
      expect(config.authority.toString()).to.equal(buyer.publicKey.toString());
      expect(config.adminPubkeys).to.have.lengthOf(1);
      expect(config.adminPubkeys[0].toString()).to.equal(admin.publicKey.toString());
    });
  });

  describe("Escrow Lifecycle", () => {
    let escrowPda: PublicKey;
    let vaultPda: PublicKey;

    it("Should initialize escrow", async () => {
      [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), escrowId],
        program.programId
      );

      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          amount,
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPda,
          tokenMint: mint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      const escrow = await program.account.escrowAccount.fetch(escrowPda);
      expect(escrow.buyer.toString()).to.equal(buyer.publicKey.toString());
      expect(escrow.seller.toString()).to.equal(seller.publicKey.toString());
      expect(escrow.amount.toString()).to.equal(amount.toString());
      expect(escrow.feeAmount.toString()).to.equal("20000"); // 2% of 1000000
    });

    it("Should deposit funds", async () => {
      [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPda.toBuffer()],
        program.programId
      );

      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPda,
          escrowVault: vaultPda,
          buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      const vault = await getAccount(provider.connection, vaultPda);
      expect(vault.amount.toString()).to.equal(amount.toString());

      const escrow = await program.account.escrowAccount.fetch(escrowPda);
      expect(escrow.status).to.deep.equal({ funded: {} });
    });

    it("Should submit valid AI verification", async () => {
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);

      // Create verification message
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(timestamp)]).buffer))
      ]);

      // Sign with AI agent private key
      const signature = ed25519.sign(message, aiAgent.secretKey.slice(0, 32));

      await program.methods
        .submitVerification(
          result,
          Array.from(evidenceHash),
          new anchor.BN(timestamp),
          Array.from(signature)
        )
        .accounts({
          escrow: escrowPda,
          aiAgent: aiAgent.publicKey,
        })
        .rpc();

      const escrow = await program.account.escrowAccount.fetch(escrowPda);
      expect(escrow.status).to.deep.equal({ verified: {} });
      expect(escrow.verificationResult).to.equal(true);
    });

    it("Should release funds to seller", async () => {
      const sellerBalanceBefore = await getAccount(provider.connection, sellerTokenAccount);
      const treasuryBalanceBefore = await getAccount(provider.connection, protocolTreasury);

      await program.methods
        .releaseFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPda,
          escrowVault: vaultPda,
          sellerTokenAccount,
          protocolTreasury,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([buyer])
        .rpc();

      const sellerBalanceAfter = await getAccount(provider.connection, sellerTokenAccount);
      const treasuryBalanceAfter = await getAccount(provider.connection, protocolTreasury);

      // Seller should receive amount minus 2% fee
      const expectedSellerAmount = amount.toNumber() - (amount.toNumber() * 0.02);
      expect(sellerBalanceAfter.amount - sellerBalanceBefore.amount).to.equal(BigInt(expectedSellerAmount));
      
      // Treasury should receive 2% fee
      const expectedFeeAmount = amount.toNumber() * 0.02;
      expect(treasuryBalanceAfter.amount - treasuryBalanceBefore.amount).to.equal(BigInt(expectedFeeAmount));

      const escrow = await program.account.escrowAccount.fetch(escrowPda);
      expect(escrow.status).to.deep.equal({ released: {} });
    });
  });

  describe("Dispute Resolution", () => {
    let disputeEscrowPda: PublicKey;
    let disputeVaultPda: PublicKey;
    const disputeEscrowId = crypto.randomBytes(32);

    before(async () => {
      // Create new escrow for dispute testing
      [disputeEscrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), disputeEscrowId],
        program.programId
      );

      [disputeVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), disputeEscrowPda.toBuffer()],
        program.programId
      );

      // Initialize and fund escrow
      await program.methods
        .initializeEscrow(
          Array.from(disputeEscrowId),
          seller.publicKey,
          amount,
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: disputeEscrowPda,
          tokenMint: mint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: disputeEscrowPda,
          escrowVault: disputeVaultPda,
          buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
    });

    it("Should raise dispute", async () => {
      const reasonHash = crypto.randomBytes(32);

      await program.methods
        .raiseDispute(Array.from(reasonHash))
        .accounts({
          participant: buyer.publicKey,
          escrow: disputeEscrowPda,
        })
        .signers([buyer])
        .rpc();

      const escrow = await program.account.escrowAccount.fetch(disputeEscrowPda);
      expect(escrow.status).to.deep.equal({ disputed: {} });
      expect(escrow.disputeRaised).to.be.true;
      expect(escrow.disputeDeadline).to.not.be.null;
    });

    it("Should resolve dispute in favor of seller", async () => {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      await program.methods
        .resolveDispute({ favorSeller: {} })
        .accounts({
          admin: admin.publicKey,
          escrow: disputeEscrowPda,
          config: configPda,
        })
        .signers([admin])
        .rpc();

      const escrow = await program.account.escrowAccount.fetch(disputeEscrowPda);
      expect(escrow.status).to.deep.equal({ verified: {} });
      expect(escrow.disputeRaised).to.be.false;
      expect(escrow.verificationResult).to.be.true;
    });
  });

  describe("Error Cases", () => {
    it("Should fail with invalid AI agent signature", async () => {
      const invalidEscrowId = crypto.randomBytes(32);
      const [invalidEscrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), invalidEscrowId],
        program.programId
      );

      // Initialize escrow
      await program.methods
        .initializeEscrow(
          Array.from(invalidEscrowId),
          seller.publicKey,
          amount,
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: invalidEscrowPda,
          tokenMint: mint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      // Fund escrow
      const [invalidVaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), invalidEscrowPda.toBuffer()],
        program.programId
      );

      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: invalidEscrowPda,
          escrowVault: invalidVaultPda,
          buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();

      // Try to submit verification with invalid signature
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      const invalidSignature = crypto.randomBytes(64);

      try {
        await program.methods
          .submitVerification(
            result,
            Array.from(evidenceHash),
            new anchor.BN(timestamp),
            Array.from(invalidSignature)
          )
          .accounts({
            escrow: invalidEscrowPda,
            aiAgent: aiAgent.publicKey,
          })
          .rpc();
        
        expect.fail("Should have failed with invalid signature");
      } catch (error) {
        expect(error.message).to.include("InvalidSignature");
      }
    });

    it("Should fail unauthorized admin dispute resolution", async () => {
      const unauthorizedAdmin = Keypair.generate();
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      try {
        await program.methods
          .resolveDispute({ favorBuyer: {} })
          .accounts({
            admin: unauthorizedAdmin.publicKey,
            escrow: PublicKey.default, // dummy escrow
            config: configPda,
          })
          .signers([unauthorizedAdmin])
          .rpc();
        
        expect.fail("Should have failed with unauthorized admin");
      } catch (error) {
        expect(error.message).to.include("UnauthorizedAdmin");
      }
    });
  });
});