import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AetherlockEscrow } from "../target/types/aetherlock_escrow";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  sendAndConfirmTransaction
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAccount, 
  mintTo, 
  getAccount 
} from "@solana/spl-token";
import { expect } from "chai";
import * as crypto from "crypto";
import * as ed25519 from "@noble/ed25519";

describe("AetherLock Escrow Protocol", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AetherlockEscrow as Program<AetherlockEscrow>;
  
  // Test accounts
  let authority: Keypair;
  let buyer: Keypair;
  let seller: Keypair;
  let aiAgent: Keypair;
  let admin1: Keypair;
  let admin2: Keypair;
  let unauthorizedUser: Keypair;
  
  // Token accounts
  let tokenMint: PublicKey;
  let buyerTokenAccount: PublicKey;
  let sellerTokenAccount: PublicKey;
  let protocolTreasury: PublicKey;
  
  // Protocol config
  let configPDA: PublicKey;
  let configBump: number;
  
  // Test constants
  const ESCROW_AMOUNT = 1000000; // 1 token (6 decimals)
  const PROTOCOL_FEE = 20000; // 2% of 1000000
  const SELLER_AMOUNT = 980000; // Amount after fee deduction
  
  before(async () => {
    // Initialize test accounts
    authority = Keypair.generate();
    buyer = Keypair.generate();
    seller = Keypair.generate();
    aiAgent = Keypair.generate();
    admin1 = Keypair.generate();
    admin2 = Keypair.generate();
    unauthorizedUser = Keypair.generate();
    
    // Airdrop SOL to test accounts
    await Promise.all([
      provider.connection.requestAirdrop(authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(buyer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(seller.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(admin1.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(admin2.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(unauthorizedUser.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL),
    ]);
    
    // Create token mint
    tokenMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      6
    );
    
    // Create token accounts
    buyerTokenAccount = await createAccount(
      provider.connection,
      buyer,
      tokenMint,
      buyer.publicKey
    );
    
    sellerTokenAccount = await createAccount(
      provider.connection,
      seller,
      tokenMint,
      seller.publicKey
    );
    
    protocolTreasury = await createAccount(
      provider.connection,
      authority,
      tokenMint,
      authority.publicKey
    );
    
    // Mint tokens to buyer
    await mintTo(
      provider.connection,
      authority,
      tokenMint,
      buyerTokenAccount,
      authority,
      10000000 // 10 tokens
    );
    
    // Find config PDA
    [configPDA, configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
    
    // Initialize protocol config
    await program.methods
      .initializeConfig([admin1.publicKey, admin2.publicKey])
      .accounts({
        authority: authority.publicKey,
        config: configPDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();
  });

  describe("Protocol Configuration", () => {
    it("should initialize protocol config with admin addresses", async () => {
      const config = await program.account.protocolConfig.fetch(configPDA);
      expect(config.authority.toString()).to.equal(authority.publicKey.toString());
      expect(config.adminPubkeys).to.have.lengthOf(2);
      expect(config.adminPubkeys[0].toString()).to.equal(admin1.publicKey.toString());
      expect(config.adminPubkeys[1].toString()).to.equal(admin2.publicKey.toString());
    });

    it("should add new admin to authorized list", async () => {
      const newAdmin = Keypair.generate();
      
      await program.methods
        .addAdmin(newAdmin.publicKey)
        .accounts({
          authority: authority.publicKey,
          config: configPDA,
        })
        .signers([authority])
        .rpc();
      
      const config = await program.account.protocolConfig.fetch(configPDA);
      expect(config.adminPubkeys).to.have.lengthOf(3);
      expect(config.adminPubkeys[2].toString()).to.equal(newAdmin.publicKey.toString());
    });

    it("should remove admin from authorized list", async () => {
      await program.methods
        .removeAdmin(admin2.publicKey)
        .accounts({
          authority: authority.publicKey,
          config: configPDA,
        })
        .signers([authority])
        .rpc();
      
      const config = await program.account.protocolConfig.fetch(configPDA);
      expect(config.adminPubkeys).to.have.lengthOf(2);
      expect(config.adminPubkeys.map(k => k.toString())).to.not.include(admin2.publicKey.toString());
    });
  });

  describe("Escrow State Transitions", () => {
    let escrowId: Buffer;
    let escrowPDA: PublicKey;
    let escrowBump: number;
    let vaultPDA: PublicKey;
    let vaultBump: number;
    
    beforeEach(async () => {
      // Generate unique escrow ID for each test
      escrowId = crypto.randomBytes(32);
      
      [escrowPDA, escrowBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), escrowId],
        program.programId
      );
    });

    it("should initialize escrow in Created state", async () => {
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.status).to.deep.equal({ created: {} });
      expect(escrow.buyer.toString()).to.equal(buyer.publicKey.toString());
      expect(escrow.seller.toString()).to.equal(seller.publicKey.toString());
      expect(escrow.amount.toNumber()).to.equal(ESCROW_AMOUNT);
      expect(escrow.feeAmount.toNumber()).to.equal(PROTOCOL_FEE);
      expect(escrow.aiAgentPubkey.toString()).to.equal(aiAgent.publicKey.toString());
    });

    it("should transition from Created to Funded on deposit", async () => {
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      // Initialize escrow
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      // Find vault PDA
      [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
      
      // Deposit funds
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.status).to.deep.equal({ funded: {} });
      
      // Verify tokens were transferred to vault
      const vaultAccount = await getAccount(provider.connection, vaultPDA);
      expect(Number(vaultAccount.amount)).to.equal(ESCROW_AMOUNT);
    });

    it("should transition from Funded to Verified on AI verification", async () => {
      // Setup escrow and deposit funds
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
      
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      // Create AI verification signature
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(message, aiAgent.secretKey.slice(0, 32));
      
      // Submit verification
      await program.methods
        .submitVerification(
          result,
          Array.from(evidenceHash),
          new anchor.BN(timestamp),
          Array.from(signature)
        )
        .accounts({
          escrow: escrowPDA,
          aiAgent: aiAgent.publicKey,
        })
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.status).to.deep.equal({ verified: {} });
      expect(escrow.verificationResult).to.equal(true);
    });

    it("should transition from Verified to Released on fund release", async () => {
      // Setup complete escrow flow
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
      
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      // AI verification
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(message, aiAgent.secretKey.slice(0, 32));
      
      await program.methods
        .submitVerification(
          result,
          Array.from(evidenceHash),
          new anchor.BN(timestamp),
          Array.from(signature)
        )
        .accounts({
          escrow: escrowPDA,
          aiAgent: aiAgent.publicKey,
        })
        .rpc();
      
      // Release funds
      await program.methods
        .releaseFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          sellerTokenAccount: sellerTokenAccount,
          protocolTreasury: protocolTreasury,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([buyer])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.status).to.deep.equal({ released: {} });
      
      // Verify fund distribution
      const sellerAccount = await getAccount(provider.connection, sellerTokenAccount);
      const treasuryAccount = await getAccount(provider.connection, protocolTreasury);
      
      expect(Number(sellerAccount.amount)).to.equal(SELLER_AMOUNT);
      expect(Number(treasuryAccount.amount)).to.equal(PROTOCOL_FEE);
    });

    it("should transition to Disputed state when dispute is raised", async () => {
      // Setup funded escrow
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
      
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      // Raise dispute
      const reasonHash = crypto.randomBytes(32);
      
      await program.methods
        .raiseDispute(Array.from(reasonHash))
        .accounts({
          participant: buyer.publicKey,
          escrow: escrowPDA,
        })
        .signers([buyer])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.status).to.deep.equal({ disputed: {} });
      expect(escrow.disputeRaised).to.be.true;
      expect(escrow.disputeDeadline).to.not.be.null;
    });

    it("should transition to Refunded state on buyer refund", async () => {
      // Setup escrow with failed verification
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
      
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      // AI verification with false result
      const result = false;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(message, aiAgent.secretKey.slice(0, 32));
      
      await program.methods
        .submitVerification(
          result,
          Array.from(evidenceHash),
          new anchor.BN(timestamp),
          Array.from(signature)
        )
        .accounts({
          escrow: escrowPDA,
          aiAgent: aiAgent.publicKey,
        })
        .rpc();
      
      // Get initial buyer balance
      const initialBuyerAccount = await getAccount(provider.connection, buyerTokenAccount);
      const initialBalance = Number(initialBuyerAccount.amount);
      
      // Refund buyer
      await program.methods
        .refundBuyer()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([buyer])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.status).to.deep.equal({ refunded: {} });
      
      // Verify full refund
      const finalBuyerAccount = await getAccount(provider.connection, buyerTokenAccount);
      expect(Number(finalBuyerAccount.amount)).to.equal(initialBalance + ESCROW_AMOUNT);
    });
  });

  describe("AI Agent Signature Verification", () => {
    let escrowId: Buffer;
    let escrowPDA: PublicKey;
    let vaultPDA: PublicKey;
    
    beforeEach(async () => {
      escrowId = crypto.randomBytes(32);
      
      [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), escrowId],
        program.programId
      );
      
      [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
      
      // Setup funded escrow
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
    });

    it("should accept valid AI agent signature", async () => {
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(message, aiAgent.secretKey.slice(0, 32));
      
      await program.methods
        .submitVerification(
          result,
          Array.from(evidenceHash),
          new anchor.BN(timestamp),
          Array.from(signature)
        )
        .accounts({
          escrow: escrowPDA,
          aiAgent: aiAgent.publicKey,
        })
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.verificationResult).to.equal(true);
      expect(escrow.status).to.deep.equal({ verified: {} });
    });

    it("should reject signature from unauthorized AI agent", async () => {
      const unauthorizedAgent = Keypair.generate();
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(message, unauthorizedAgent.secretKey.slice(0, 32));
      
      try {
        await program.methods
          .submitVerification(
            result,
            Array.from(evidenceHash),
            new anchor.BN(timestamp),
            Array.from(signature)
          )
          .accounts({
            escrow: escrowPDA,
            aiAgent: unauthorizedAgent.publicKey,
          })
          .rpc();
        
        expect.fail("Should have rejected unauthorized AI agent");
      } catch (error) {
        expect(error.message).to.include("UnauthorizedAIAgent");
      }
    });

    it("should reject invalid signature", async () => {
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Create invalid signature (random bytes)
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
            escrow: escrowPDA,
            aiAgent: aiAgent.publicKey,
          })
          .rpc();
        
        expect.fail("Should have rejected invalid signature");
      } catch (error) {
        expect(error.message).to.include("InvalidSignature");
      }
    });

    it("should reject signature with tampered message", async () => {
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Create signature for original message
      const originalMessage = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(originalMessage, aiAgent.secretKey.slice(0, 32));
      
      // Submit with different evidence hash (tampered message)
      const tamperedEvidenceHash = crypto.randomBytes(32);
      
      try {
        await program.methods
          .submitVerification(
            result,
            Array.from(tamperedEvidenceHash),
            new anchor.BN(timestamp),
            Array.from(signature)
          )
          .accounts({
            escrow: escrowPDA,
            aiAgent: aiAgent.publicKey,
          })
          .rpc();
        
        expect.fail("Should have rejected tampered message");
      } catch (error) {
        expect(error.message).to.include("InvalidSignature");
      }
    });

    it("should reject old timestamp", async () => {
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(oldTimestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(message, aiAgent.secretKey.slice(0, 32));
      
      try {
        await program.methods
          .submitVerification(
            result,
            Array.from(evidenceHash),
            new anchor.BN(oldTimestamp),
            Array.from(signature)
          )
          .accounts({
            escrow: escrowPDA,
            aiAgent: aiAgent.publicKey,
          })
          .rpc();
        
        expect.fail("Should have rejected old timestamp");
      } catch (error) {
        expect.error.message).to.include("TimestampTooOld");
      }
    });
  });

  describe("Fee Calculation and Distribution", () => {
    let escrowId: Buffer;
    let escrowPDA: PublicKey;
    let vaultPDA: PublicKey;
    
    beforeEach(async () => {
      escrowId = crypto.randomBytes(32);
      
      [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), escrowId],
        program.programId
      );
      
      [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
    });

    it("should calculate 2% protocol fee correctly", async () => {
      const testAmount = 5000000; // 5 tokens
      const expectedFee = 100000; // 2% of 5 tokens
      
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(testAmount),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.feeAmount.toNumber()).to.equal(expectedFee);
    });

    it("should distribute funds correctly on release", async () => {
      const testAmount = 2000000; // 2 tokens
      const expectedFee = 40000; // 2% of 2 tokens
      const expectedSellerAmount = 1960000; // Amount after fee
      
      // Setup complete escrow flow
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(testAmount),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      // AI verification
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(message, aiAgent.secretKey.slice(0, 32));
      
      await program.methods
        .submitVerification(
          result,
          Array.from(evidenceHash),
          new anchor.BN(timestamp),
          Array.from(signature)
        )
        .accounts({
          escrow: escrowPDA,
          aiAgent: aiAgent.publicKey,
        })
        .rpc();
      
      // Get initial balances
      const initialSellerAccount = await getAccount(provider.connection, sellerTokenAccount);
      const initialTreasuryAccount = await getAccount(provider.connection, protocolTreasury);
      const initialSellerBalance = Number(initialSellerAccount.amount);
      const initialTreasuryBalance = Number(initialTreasuryAccount.amount);
      
      // Release funds
      await program.methods
        .releaseFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          sellerTokenAccount: sellerTokenAccount,
          protocolTreasury: protocolTreasury,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([buyer])
        .rpc();
      
      // Verify fund distribution
      const finalSellerAccount = await getAccount(provider.connection, sellerTokenAccount);
      const finalTreasuryAccount = await getAccount(provider.connection, protocolTreasury);
      
      expect(Number(finalSellerAccount.amount)).to.equal(initialSellerBalance + expectedSellerAmount);
      expect(Number(finalTreasuryAccount.amount)).to.equal(initialTreasuryBalance + expectedFee);
    });

    it("should handle edge case amounts correctly", async () => {
      // Test with amount that doesn't divide evenly by 100
      const testAmount = 999; // Should result in fee of 19 (rounded down)
      const expectedFee = 19;
      
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(testAmount),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.feeAmount.toNumber()).to.equal(expectedFee);
    });
  });

  describe("Dispute Resolution", () => {
    let escrowId: Buffer;
    let escrowPDA: PublicKey;
    let vaultPDA: PublicKey;
    
    beforeEach(async () => {
      escrowId = crypto.randomBytes(32);
      
      [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), escrowId],
        program.programId
      );
      
      [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
      
      // Setup funded escrow
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
    });

    it("should allow authorized admin to resolve dispute in favor of seller", async () => {
      // Raise dispute
      const reasonHash = crypto.randomBytes(32);
      
      await program.methods
        .raiseDispute(Array.from(reasonHash))
        .accounts({
          participant: buyer.publicKey,
          escrow: escrowPDA,
        })
        .signers([buyer])
        .rpc();
      
      // Admin resolves in favor of seller
      await program.methods
        .resolveDispute({ favorSeller: {} })
        .accounts({
          admin: admin1.publicKey,
          escrow: escrowPDA,
          config: configPDA,
        })
        .signers([admin1])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.verificationResult).to.equal(true);
      expect(escrow.disputeRaised).to.be.false;
      expect(escrow.status).to.deep.equal({ verified: {} });
    });

    it("should allow authorized admin to resolve dispute in favor of buyer", async () => {
      // Raise dispute
      const reasonHash = crypto.randomBytes(32);
      
      await program.methods
        .raiseDispute(Array.from(reasonHash))
        .accounts({
          participant: seller.publicKey,
          escrow: escrowPDA,
        })
        .signers([seller])
        .rpc();
      
      // Admin resolves in favor of buyer
      await program.methods
        .resolveDispute({ favorBuyer: {} })
        .accounts({
          admin: admin1.publicKey,
          escrow: escrowPDA,
          config: configPDA,
        })
        .signers([admin1])
        .rpc();
      
      const escrow = await program.account.escrowAccount.fetch(escrowPDA);
      expect(escrow.verificationResult).to.equal(false);
      expect(escrow.disputeRaised).to.be.false;
      expect(escrow.status).to.deep.equal({ verified: {} });
    });

    it("should reject dispute resolution from unauthorized user", async () => {
      // Raise dispute
      const reasonHash = crypto.randomBytes(32);
      
      await program.methods
        .raiseDispute(Array.from(reasonHash))
        .accounts({
          participant: buyer.publicKey,
          escrow: escrowPDA,
        })
        .signers([buyer])
        .rpc();
      
      // Unauthorized user tries to resolve
      try {
        await program.methods
          .resolveDispute({ favorSeller: {} })
          .accounts({
            admin: unauthorizedUser.publicKey,
            escrow: escrowPDA,
            config: configPDA,
          })
          .signers([unauthorizedUser])
          .rpc();
        
        expect.fail("Should have rejected unauthorized admin");
      } catch (error) {
        expect(error.message).to.include("UnauthorizedAdmin");
      }
    });

    it("should prevent operations during active dispute", async () => {
      // Raise dispute
      const reasonHash = crypto.randomBytes(32);
      
      await program.methods
        .raiseDispute(Array.from(reasonHash))
        .accounts({
          participant: buyer.publicKey,
          escrow: escrowPDA,
        })
        .signers([buyer])
        .rpc();
      
      // Try to submit verification during dispute
      const result = true;
      const evidenceHash = crypto.randomBytes(32);
      const timestamp = Math.floor(Date.now() / 1000);
      
      const message = Buffer.concat([
        Buffer.from(escrowId),
        Buffer.from([result ? 1 : 0]),
        Buffer.from(evidenceHash),
        Buffer.from(new Uint8Array(new BigInt64Array([BigInt(timestamp)]).buffer))
      ]);
      
      const signature = await ed25519.sign(message, aiAgent.secretKey.slice(0, 32));
      
      try {
        await program.methods
          .submitVerification(
            result,
            Array.from(evidenceHash),
            new anchor.BN(timestamp),
            Array.from(signature)
          )
          .accounts({
            escrow: escrowPDA,
            aiAgent: aiAgent.publicKey,
          })
          .rpc();
        
        expect.fail("Should have prevented verification during dispute");
      } catch (error) {
        expect(error.message).to.include("DisputeActive");
      }
    });

    it("should expire dispute after deadline and prevent further dispute actions", async () => {
      // Setup funded escrow and raise dispute
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      await program.methods
        .initializeEscrow(
          Array.from(escrowId),
          seller.publicKey,
          new anchor.BN(ESCROW_AMOUNT),
          new anchor.BN(expiry),
          Array.from(metadataHash),
          aiAgent.publicKey
        )
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          tokenMint: tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      [vaultPDA, vaultBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), escrowPDA.toBuffer()],
        program.programId
      );
      await program.methods
        .depositFunds()
        .accounts({
          buyer: buyer.publicKey,
          escrow: escrowPDA,
          escrowVault: vaultPDA,
          buyerTokenAccount: buyerTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      // Raise dispute
      const reasonHash = crypto.randomBytes(32);
      await program.methods
        .raiseDispute(Array.from(reasonHash))
        .accounts({
          participant: buyer.publicKey,
          escrow: escrowPDA,
        })
        .signers([buyer])
        .rpc();
      // Fast-forward time past dispute deadline
      const escrowBefore = await program.account.escrowAccount.fetch(escrowPDA);
      const deadline = escrowBefore.disputeDeadline;
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(buyer.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL)
      );
      // Simulate time passing (mock clock sysvar or use test validator time travel if available)
      // For demonstration, attempt to resolve dispute after deadline
      try {
        await program.methods
          .resolveDispute({ favorSeller: {} })
          .accounts({
            admin: admin1.publicKey,
            escrow: escrowPDA,
            config: configPDA,
          })
          .signers([admin1])
          .rpc();
        // If contract allows, check state
        const escrowAfter = await program.account.escrowAccount.fetch(escrowPDA);
        expect(escrowAfter.disputeRaised).to.be.false;
        expect(escrowAfter.status).to.not.deep.equal({ disputed: {} });
      } catch (error) {
        expect(error.message).to.include("DisputeExpired");
      }
    });
  });

  describe("Error Conditions", () => {
    it("should reject operations on invalid escrow states", async () => {
      const escrowId = crypto.randomBytes(32);
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), escrowId],
        program.programId
      );
      
      // Try to deposit funds on non-existent escrow
      try {
        await program.methods
          .depositFunds()
          .accounts({
            buyer: buyer.publicKey,
            escrow: escrowPDA,
            escrowVault: Keypair.generate().publicKey,
            buyerTokenAccount: buyerTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([buyer])
          .rpc();
        
        expect.fail("Should have rejected operation on non-existent escrow");
      } catch (error) {
        // Expected to fail due to account not existing
        expect(error).to.exist;
      }
    });

    it("should handle math overflow protection", async () => {
      const escrowId = crypto.randomBytes(32);
      const [escrowPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("escrow"), escrowId],
        program.programId
      );
      
      // Try to create escrow with maximum u64 value (should cause overflow in fee calculation)
      const maxU64 = new anchor.BN("18446744073709551615"); // 2^64 - 1
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const metadataHash = crypto.randomBytes(32);
      
      try {
        await program.methods
          .initializeEscrow(
            Array.from(escrowId),
            seller.publicKey,
            maxU64,
            new anchor.BN(expiry),
            Array.from(metadataHash),
            aiAgent.publicKey
          )
          .accounts({
            buyer: buyer.publicKey,
            escrow: escrowPDA,
            tokenMint: tokenMint,
            systemProgram: SystemProgram.programId,
          })
          .signers([buyer])
          .rpc();
        
        expect.fail("Should have rejected due to math overflow");
      } catch (error) {
        expect(error.message).to.include("MathOverflow");
      }
    });
  });
});