# AetherLock Protocol - Key Code Snippets

## 🔗 Solana Smart Contract (Rust/Anchor)

### Escrow Account Structure
```rust
use anchor_lang::prelude::*;

#[account]
pub struct EscrowAccount {
    pub escrow_id: [u8; 32],
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub fee_amount: u64, // 2% of amount
    pub status: EscrowStatus,
    pub expiry: i64,
    pub metadata_hash: [u8; 32],
    pub verification_result: Option<bool>,
    pub evidence_hash: Option<[u8; 32]>,
    pub dispute_raised: bool,
    pub dispute_deadline: Option<i64>,
    pub ai_agent_pubkey: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Verified,
    Disputed,
    Released,
    Refunded,
}
```

### Initialize Escrow Instruction
```rust
#[derive(Accounts)]
#[instruction(escrow_id: [u8; 32])]
pub struct InitializeEscrow<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + std::mem::size_of::<EscrowAccount>(),
        seeds = [b"escrow", escrow_id.as_ref()],
        bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: Seller address validation
    pub seller: AccountInfo<'info>,
    
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_escrow(
    ctx: Context<InitializeEscrow>,
    escrow_id: [u8; 32],
    amount: u64,
    expiry: i64,
    metadata_hash: [u8; 32],
    ai_agent_pubkey: Pubkey,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let fee_amount = amount.checked_mul(2).unwrap().checked_div(100).unwrap();
    
    escrow.escrow_id = escrow_id;
    escrow.buyer = ctx.accounts.buyer.key();
    escrow.seller = ctx.accounts.seller.key();
    escrow.token_mint = ctx.accounts.token_mint.key();
    escrow.amount = amount;
    escrow.fee_amount = fee_amount;
    escrow.status = EscrowStatus::Created;
    escrow.expiry = expiry;
    escrow.metadata_hash = metadata_hash;
    escrow.ai_agent_pubkey = ai_agent_pubkey;
    escrow.bump = *ctx.bumps.get("escrow").unwrap();
    
    Ok(())
}
```

### AI Verification with Signature Validation
```rust
use ed25519_dalek::{PublicKey, Signature, Verifier};

#[derive(Accounts)]
pub struct SubmitVerification<'info> {
    #[account(
        mut,
        constraint = escrow.status == EscrowStatus::Funded
    )]
    pub escrow: Account<'info, EscrowAccount>,
    
    pub signer: Signer<'info>,
}

pub fn submit_verification(
    ctx: Context<SubmitVerification>,
    result: bool,
    evidence_hash: [u8; 32],
    signature: [u8; 64],
    timestamp: i64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    
    // Create verification payload
    let payload = VerificationPayload {
        escrow_id: escrow.escrow_id,
        result,
        evidence_hash,
        timestamp,
    };
    
    let message = payload.to_bytes();
    
    // Verify AI agent signature
    let public_key = PublicKey::from_bytes(&escrow.ai_agent_pubkey.to_bytes())
        .map_err(|_| ErrorCode::InvalidPublicKey)?;
    
    let signature = Signature::from_bytes(&signature)
        .map_err(|_| ErrorCode::InvalidSignature)?;
    
    public_key.verify(&message, &signature)
        .map_err(|_| ErrorCode::SignatureVerificationFailed)?;
    
    // Update escrow state
    escrow.verification_result = Some(result);
    escrow.evidence_hash = Some(evidence_hash);
    escrow.status = EscrowStatus::Verified;
    
    Ok(())
}
```

## 🤖 AI Agent Service (Node.js)

### Signature Generation Service
```javascript
const ed25519 = require('ed25519');
const crypto = require('crypto');

class SignatureService {
    constructor() {
        // Generate or load AI agent keypair
        this.keypair = this.loadOrGenerateKeypair();
    }
    
    loadOrGenerateKeypair() {
        if (process.env.AI_AGENT_PRIVATE_KEY) {
            const privateKey = Buffer.from(process.env.AI_AGENT_PRIVATE_KEY, 'hex');
            const publicKey = ed25519.publicKeyFromPrivateKey(privateKey);
            return { privateKey, publicKey };
        }
        
        // Generate new keypair for development
        const seed = crypto.randomBytes(32);
        const keypair = ed25519.createKeyPair(seed);
        console.log('Generated AI Agent Public Key:', keypair.publicKey.toString('hex'));
        return keypair;
    }
    
    signVerification(escrowId, result, evidenceHash, timestamp) {
        const payload = {
            escrow_id: escrowId,
            result,
            evidence_hash: evidenceHash,
            timestamp
        };
        
        const message = this.serializePayload(payload);
        const signature = ed25519.sign(message, this.keypair.privateKey);
        
        return {
            payload,
            signature: signature.toString('hex'),
            publicKey: this.keypair.publicKey.toString('hex')
        };
    }
    
    serializePayload(payload) {
        // Create deterministic byte representation
        const buffer = Buffer.alloc(32 + 1 + 32 + 8);
        let offset = 0;
        
        // escrow_id (32 bytes)
        Buffer.from(payload.escrow_id, 'hex').copy(buffer, offset);
        offset += 32;
        
        // result (1 byte)
        buffer.writeUInt8(payload.result ? 1 : 0, offset);
        offset += 1;
        
        // evidence_hash (32 bytes)
        Buffer.from(payload.evidence_hash, 'hex').copy(buffer, offset);
        offset += 32;
        
        // timestamp (8 bytes)
        buffer.writeBigUInt64BE(BigInt(payload.timestamp), offset);
        
        return buffer;
    }
}

module.exports = SignatureService;
```

### AI Verification Service
```javascript
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class AIVerificationService {
    constructor() {
        this.bedrock = new BedrockRuntimeClient({
            region: process.env.AWS_REGION || 'us-east-1'
        });
    }
    
    async verifyTaskCompletion(taskDescription, evidenceFiles) {
        try {
            const prompt = this.buildVerificationPrompt(taskDescription, evidenceFiles);
            
            const command = new InvokeModelCommand({
                modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify({
                    anthropic_version: 'bedrock-2023-05-31',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });
            
            const response = await this.bedrock.send(command);
            const result = JSON.parse(new TextDecoder().decode(response.body));
            
            return this.parseVerificationResult(result.content[0].text);
        } catch (error) {
            console.error('AI verification failed:', error);
            throw new Error('AI verification service unavailable');
        }
    }
    
    buildVerificationPrompt(taskDescription, evidenceFiles) {
        return `
You are an AI agent verifying task completion for an escrow system.

Task Description: ${taskDescription}

Evidence Files: ${evidenceFiles.map(f => f.name).join(', ')}

Analyze the evidence and determine if the task has been completed satisfactorily.

Respond with a JSON object:
{
    "verified": true/false,
    "confidence": 0.0-1.0,
    "reasoning": "explanation of decision"
}

Be objective and thorough in your analysis.
        `;
    }
    
    parseVerificationResult(aiResponse) {
        try {
            const result = JSON.parse(aiResponse);
            return {
                verified: result.verified,
                confidence: result.confidence,
                reasoning: result.reasoning
            };
        } catch (error) {
            // Fallback parsing for non-JSON responses
            const verified = aiResponse.toLowerCase().includes('verified: true') || 
                           aiResponse.toLowerCase().includes('"verified": true');
            return {
                verified,
                confidence: verified ? 0.8 : 0.2,
                reasoning: aiResponse
            };
        }
    }
}

module.exports = AIVerificationService;
```

## 🔐 zkMe Integration (Frontend)

### KYC Verification Component
```typescript
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface KYCVerificationProps {
    onVerificationComplete: (proofHash: string) => void;
}

export function KYCVerification({ onVerificationComplete }: KYCVerificationProps) {
    const { publicKey } = useWallet();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    
    const initiateKYC = async () => {
        if (!publicKey) return;
        
        setIsVerifying(true);
        setVerificationStatus('pending');
        
        try {
            // Initialize zkMe SDK
            const zkme = await import('@zkme/sdk');
            
            const verification = await zkme.verifyKYC({
                walletAddress: publicKey.toString(),
                chain: 'zeta-testnet',
                redirectUrl: `${window.location.origin}/kyc/callback`
            });
            
            if (verification.success) {
                // Store proof hash on Zeta Chain
                await storeProofOnChain(verification.proofHash);
                setVerificationStatus('success');
                onVerificationComplete(verification.proofHash);
            } else {
                setVerificationStatus('error');
            }
        } catch (error) {
            console.error('KYC verification failed:', error);
            setVerificationStatus('error');
        } finally {
            setIsVerifying(false);
        }
    };
    
    const storeProofOnChain = async (proofHash: string) => {
        // Call backend service to store proof on Zeta Chain
        const response = await fetch('/api/kyc/store-proof', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress: publicKey?.toString(),
                proofHash
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to store proof on chain');
        }
    };
    
    return (
        <div className="kyc-verification">
            <div className="bg-gray-900 border border-purple-500 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Identity Verification</h3>
                <p className="text-gray-300 mb-6">
                    Complete KYC verification using zero-knowledge proofs to participate in escrows.
                </p>
                
                {verificationStatus === 'idle' && (
                    <button
                        onClick={initiateKYC}
                        disabled={!publicKey || isVerifying}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        {isVerifying ? 'Initiating Verification...' : 'Start KYC Verification'}
                    </button>
                )}
                
                {verificationStatus === 'pending' && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-purple-400">Verification in progress...</p>
                    </div>
                )}
                
                {verificationStatus === 'success' && (
                    <div className="text-center text-green-400">
                        <div className="text-2xl mb-2">✅</div>
                        <p>KYC verification completed successfully!</p>
                    </div>
                )}
                
                {verificationStatus === 'error' && (
                    <div className="text-center text-red-400">
                        <div className="text-2xl mb-2">❌</div>
                        <p>Verification failed. Please try again.</p>
                        <button
                            onClick={() => setVerificationStatus('idle')}
                            className="mt-4 text-purple-400 hover:text-purple-300 underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
```

## 🎨 Advanced UI Components (React + Framer Motion)

### 3D Escrow Card Component
```typescript
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EscrowCardProps {
    escrow: {
        id: string;
        amount: number;
        status: string;
        seller: string;
        createdAt: Date;
    };
    onClick: () => void;
}

export function EscrowCard({ escrow, onClick }: EscrowCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    const cardVariants = {
        initial: { 
            rotateX: 0, 
            rotateY: 0, 
            scale: 1,
            boxShadow: '0 4px 6px rgba(147, 51, 234, 0.1)'
        },
        hover: { 
            rotateX: -5, 
            rotateY: 5, 
            scale: 1.05,
            boxShadow: '0 20px 40px rgba(147, 51, 234, 0.3)'
        }
    };
    
    const glowVariants = {
        initial: { opacity: 0 },
        hover: { opacity: 1 }
    };
    
    return (
        <motion.div
            className="relative cursor-pointer"
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={onClick}
            style={{ perspective: 1000 }}
        >
            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur-lg"
                variants={glowVariants}
                initial="initial"
                animate={isHovered ? "hover" : "initial"}
            />
            
            {/* Card content */}
            <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            Escrow #{escrow.id.slice(0, 8)}
                        </h3>
                        <p className="text-gray-400 text-sm">
                            {escrow.createdAt.toLocaleDateString()}
                        </p>
                    </div>
                    <StatusBadge status={escrow.status} />
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-mono">
                            {escrow.amount} SOL
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Seller:</span>
                        <span className="text-white font-mono text-sm">
                            {escrow.seller.slice(0, 8)}...
                        </span>
                    </div>
                </div>
                
                {/* Animated progress bar */}
                <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: getProgressWidth(escrow.status) }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'created': return 'bg-yellow-500';
            case 'funded': return 'bg-blue-500';
            case 'verified': return 'bg-green-500';
            case 'disputed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };
    
    return (
        <motion.span
            className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(status)}`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
        >
            {status.toUpperCase()}
        </motion.span>
    );
}

function getProgressWidth(status: string): string {
    switch (status) {
        case 'created': return '25%';
        case 'funded': return '50%';
        case 'verified': return '75%';
        case 'released': return '100%';
        default: return '0%';
    }
}
```

### Particle Background Component
```typescript
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ParticleBackground() {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene>();
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const particlesRef = useRef<THREE.Points>();
    
    useEffect(() => {
        if (!mountRef.current) return;
        
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);
        
        // Particle system
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = (Math.random() - 0.5) * 100;
            positions[i + 2] = (Math.random() - 0.5) * 100;
            
            // Purple to cyan gradient
            const t = Math.random();
            colors[i] = 0.6 + t * 0.4;     // R
            colors[i + 1] = 0.2 + t * 0.6; // G
            colors[i + 2] = 0.8 + t * 0.2; // B
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
        
        camera.position.z = 50;
        
        // Store references
        sceneRef.current = scene;
        rendererRef.current = renderer;
        particlesRef.current = particles;
        
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            if (particlesRef.current) {
                particlesRef.current.rotation.x += 0.001;
                particlesRef.current.rotation.y += 0.002;
            }
            
            renderer.render(scene, camera);
        };
        
        animate();
        
        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);
    
    return (
        <div
            ref={mountRef}
            className="fixed inset-0 -z-10"
            style={{ pointerEvents: 'none' }}
        />
    );
}
```

## 📱 IPFS Evidence Upload

### Evidence Upload Service
```javascript
import { Web3Storage } from 'web3.storage';

class EvidenceService {
    constructor() {
        this.client = new Web3Storage({ 
            token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN 
        });
    }
    
    async uploadEvidence(files) {
        try {
            const cid = await this.client.put(files, {
                name: `escrow-evidence-${Date.now()}`,
                maxRetries: 3
            });
            
            return {
                success: true,
                hash: cid,
                urls: files.map(file => `https://${cid}.ipfs.w3s.link/${file.name}`)
            };
        } catch (error) {
            console.error('IPFS upload failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async retrieveEvidence(hash) {
        try {
            const res = await this.client.get(hash);
            const files = await res.files();
            
            return {
                success: true,
                files: files.map(file => ({
                    name: file.name,
                    size: file.size,
                    url: `https://${hash}.ipfs.w3s.link/${file.name}`
                }))
            };
        } catch (error) {
            console.error('IPFS retrieval failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default EvidenceService;
```

These code snippets provide a solid foundation for building AetherLock with impressive visual design and robust functionality. The combination of Solana smart contracts, AI-powered verification, zkMe KYC integration, and stunning UI animations will create a compelling hackathon submission that showcases both technical depth and visual excellence.