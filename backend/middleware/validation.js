export const validateEscrowCreation = (req, res, next) => {
  const { title, amount, destinationChain } = req.body;
  
  if (!title || title.length < 3) {
    return res.status(400).json({ success: false, error: 'Title must be at least 3 characters' });
  }
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, error: 'Amount must be positive' });
  }
  
  if (!destinationChain) {
    return res.status(400).json({ success: false, error: 'Destination chain required' });
  }
  
  next();
};

export const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip).filter(time => now - time < windowMs);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ success: false, error: 'Too many requests' });
    }
    
    userRequests.push(now);
    requests.set(ip, userRequests);
    next();
  };
};