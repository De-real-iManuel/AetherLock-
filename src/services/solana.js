import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';

// Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const programId = new PublicKey('AetherLockEscrow11111111111111111111111111');

export const connectWallet = async () => {
  try {
    const { solana } = window;
    
    if (!solana?.isPhantom) {
      throw new Error('Phantom wallet not found! Please install Phantom wallet.');
    }

    const response = await solana.connect();
    return {
      success: true,
      publicKey: response.publicKey.toString(),
      wallet: solana
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const getWalletBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get balance:', error);
    return 0;
  }
};

export const createEscrowAccount = async (wallet, sellerPublicKey, amount) => {
  try {
    const buyerPublicKey = wallet.publicKey;
    
    // Generate escrow PDA
    const [escrowPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('escrow'),
        buyerPublicKey.toBuffer(),
        new PublicKey(sellerPublicKey).toBuffer()
      ],
      programId
    );

    // Create transaction
    const transaction = new Transaction();
    
    // For demo: simple SOL transfer to escrow PDA
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: buyerPublicKey,
      toPubkey: escrowPDA,
      lamports: amount * LAMPORTS_PER_SOL
    });
    
    transaction.add(transferInstruction);
    
    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = buyerPublicKey;

    // Sign and send transaction
    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return {
      success: true,
      signature,
      escrowAddress: escrowPDA.toString(),
      amount
    };
    
  } catch (error) {
    console.error('Escrow creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const releaseEscrowFunds = async (wallet, escrowAddress, sellerPublicKey) => {
  try {
    const transaction = new Transaction();
    
    // Transfer from escrow to seller
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(escrowAddress),
      toPubkey: new PublicKey(sellerPublicKey),
      lamports: await connection.getBalance(new PublicKey(escrowAddress))
    });
    
    transaction.add(transferInstruction);
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    await connection.confirmTransaction(signature);
    
    return {
      success: true,
      signature,
      status: 'released'
    };
    
  } catch (error) {
    console.error('Release failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getTransactionDetails = async (signature) => {
  try {
    const transaction = await connection.getTransaction(signature);
    return {
      success: true,
      transaction,
      blockTime: transaction?.blockTime,
      slot: transaction?.slot
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};