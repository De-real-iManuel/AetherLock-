import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'

// Import the IDL (this would be generated from your Anchor program)
import AetherlockEscrowIDL from '../idl/aetherlock_escrow.json'

export class SolanaService {
  private connection: Connection
  private program: Program | null = null
  private provider: AnchorProvider | null = null

  constructor() {
    this.connection = new Connection(
      import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    )
  }

  async initialize(wallet: any) {
    if (!wallet) throw new Error('Wallet not connected')

    this.provider = new AnchorProvider(
      this.connection,
      wallet,
      { commitment: 'confirmed' }
    )

    const programId = new PublicKey(
      import.meta.env.VITE_SOLANA_PROGRAM_ID || 'AetherLockEscrow11111111111111111111111111'
    )

    this.program = new Program(
      AetherlockEscrowIDL as Idl,
      programId,
      this.provider
    )
  }

  async createEscrow(params: {
    escrowId: string
    seller: string
    amount: number
    expiry: number
    taskDescription: string
    aiAgentPublicKey: string
    tokenMint: string
  }) {
    if (!this.program || !this.provider) throw new Error('Service not initialized')

    const escrowIdBuffer = Buffer.from(params.escrowId, 'hex')
    const metadataHash = Buffer.from(params.taskDescription).slice(0, 32)

    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), escrowIdBuffer],
      this.program.programId
    )

    const tx = await this.program.methods
      .initializeEscrow(
        Array.from(escrowIdBuffer),
        new PublicKey(params.seller),
        new BN(params.amount * 1e6), // Convert to lamports
        new BN(params.expiry),
        Array.from(metadataHash),
        new PublicKey(params.aiAgentPublicKey)
      )
      .accounts({
        buyer: this.provider.wallet.publicKey,
        escrow: escrowPda,
        tokenMint: new PublicKey(params.tokenMint),
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    const signature = await this.provider.sendAndConfirm(tx)
    return { signature, escrowPda: escrowPda.toString() }
  }

  async depositFunds(escrowId: string, tokenMint: string) {
    if (!this.program || !this.provider) throw new Error('Service not initialized')

    const escrowIdBuffer = Buffer.from(escrowId, 'hex')
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), escrowIdBuffer],
      this.program.programId
    )

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), escrowPda.toBuffer()],
      this.program.programId
    )

    const buyerTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      this.provider.wallet.publicKey
    )

    const tx = await this.program.methods
      .depositFunds()
      .accounts({
        buyer: this.provider.wallet.publicKey,
        escrow: escrowPda,
        escrowVault: vaultPda,
        buyerTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction()

    const signature = await this.provider.sendAndConfirm(tx)
    return { signature }
  }

  async submitVerification(
    escrowId: string,
    result: boolean,
    evidenceHash: number[],
    timestamp: number,
    signature: number[],
    aiAgentPublicKey: string
  ) {
    if (!this.program || !this.provider) throw new Error('Service not initialized')

    const escrowIdBuffer = Buffer.from(escrowId, 'hex')
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), escrowIdBuffer],
      this.program.programId
    )

    const tx = await this.program.methods
      .submitVerification(
        result,
        evidenceHash,
        new BN(timestamp),
        signature
      )
      .accounts({
        escrow: escrowPda,
        aiAgent: new PublicKey(aiAgentPublicKey),
      })
      .transaction()

    const txSignature = await this.provider.sendAndConfirm(tx)
    return { signature: txSignature }
  }

  async releaseFunds(escrowId: string, tokenMint: string, sellerAddress: string) {
    if (!this.program || !this.provider) throw new Error('Service not initialized')

    const escrowIdBuffer = Buffer.from(escrowId, 'hex')
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), escrowIdBuffer],
      this.program.programId
    )

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), escrowPda.toBuffer()],
      this.program.programId
    )

    const sellerTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      new PublicKey(sellerAddress)
    )

    const protocolTreasury = await getAssociatedTokenAddress(
      new PublicKey(tokenMint),
      new PublicKey(import.meta.env.VITE_TREASURY_WALLET || this.provider.wallet.publicKey.toString())
    )

    const tx = await this.program.methods
      .releaseFunds()
      .accounts({
        buyer: this.provider.wallet.publicKey,
        escrow: escrowPda,
        escrowVault: vaultPda,
        sellerTokenAccount,
        protocolTreasury,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction()

    const signature = await this.provider.sendAndConfirm(tx)
    return { signature }
  }

  async getEscrowAccount(escrowId: string) {
    if (!this.program) throw new Error('Service not initialized')

    const escrowIdBuffer = Buffer.from(escrowId, 'hex')
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), escrowIdBuffer],
      this.program.programId
    )

    return await this.program.account.escrowAccount.fetch(escrowPda)
  }

  async raiseDispute(escrowId: string, reasonHash: string) {
    if (!this.program || !this.provider) throw new Error('Service not initialized')

    const escrowIdBuffer = Buffer.from(escrowId, 'hex')
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), escrowIdBuffer],
      this.program.programId
    )

    const tx = await this.program.methods
      .raiseDispute(Array.from(Buffer.from(reasonHash, 'hex')))
      .accounts({
        participant: this.provider.wallet.publicKey,
        escrow: escrowPda,
      })
      .transaction()

    const signature = await this.provider.sendAndConfirm(tx)
    return { signature }
  }
}

export const solanaService = new SolanaService()