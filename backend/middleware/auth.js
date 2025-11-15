import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Verify wallet signature for authentication
 * Expects Authorization header with format: "Bearer <signature>:<message>:<publicKey>"
 */
export const verifyWalletSignature = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const [signature, message, publicKey] = token.split(':');
    
    if (!signature || !message || !publicKey) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization token format'
      });
    }
    
    // Verify Solana signature
    try {
      const signatureBytes = bs58.decode(signature);
      const messageBytes = new TextEncoder().encode(message);
      const publicKeyBytes = bs58.decode(publicKey);
      
      const verified = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );
      
      if (!verified) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }
      
      // Attach user info to request
      req.user = {
        walletAddress: publicKey,
        verified: true
      };
      
      next();
    } catch (verifyError) {
      console.error('Signature verification error:', verifyError);
      return res.status(401).json({
        success: false,
        error: 'Signature verification failed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const [signature, message, publicKey] = token.split(':');
    
    if (signature && message && publicKey) {
      try {
        const signatureBytes = bs58.decode(signature);
        const messageBytes = new TextEncoder().encode(message);
        const publicKeyBytes = bs58.decode(publicKey);
        
        const verified = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKeyBytes
        );
        
        if (verified) {
          req.user = {
            walletAddress: publicKey,
            verified: true
          };
        }
      } catch (verifyError) {
        // Silently fail for optional auth
        console.log('Optional auth verification failed:', verifyError.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};
