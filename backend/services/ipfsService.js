import axios from 'axios';
import FormData from 'form-data';

class IPFSService {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY || '5e3eab331e704fb728d7';
    this.apiSecret = process.env.PINATA_API_SECRET || '427982210dc0febf7a87cf9e62a1d2f79e58e5deae67adef37dabbf8f0c348e5';
    this.jwt = process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyOGNmMTQwMi1jY2Q4LTRjMWItODZlZi1lNjFjZDZjODExNTIiLCJlbWFpbCI6Im53YWphcmllbW1hbnVlbDM1NUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWUzZWFiMzMxZTcwNGZiNzI4ZDciLCJzY29wZWRLZXlTZWNyZXQiOiI0Mjc5ODIyMTBkYzBmZWJmN2E4N2NmOWU2MmExZDJmNzllNThlNWRlYWU2N2FkZWYzN2RhYmJmOGYwYzM0OGU1IiwiZXhwIjoxNzk0NDE5MjEzfQ.0QJ_dmcAzfHNqXXkgNpCqvYQdSxL6U8bm0tfOvGWB4g';
    this.gateway = process.env.PINATA_GATEWAY || 'fuchsia-worrying-chickadee-416.mypinata.cloud';
    this.pinataUrl = 'https://api.pinata.cloud';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.maxFileSize = 100 * 1024 * 1024; // 100MB
  }

  /**
   * Retry helper with exponential backoff
   */
  async retryWithBackoff(fn, retries = this.maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        
        const delay = this.retryDelay * Math.pow(2, i);
        console.log(`Retry attempt ${i + 1}/${retries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Validate file size
   */
  validateFileSize(fileSize) {
    if (fileSize > this.maxFileSize) {
      throw new Error(`File size ${fileSize} exceeds maximum allowed size of ${this.maxFileSize} bytes (100MB)`);
    }
  }

  /**
   * Upload file to IPFS via Pinata with metadata and retry logic
   */
  async uploadFile(file, metadata = {}) {
    try {
      // Validate file size
      const fileSize = file.buffer?.length || file.size || 0;
      this.validateFileSize(fileSize);

      return await this.retryWithBackoff(async () => {
        const formData = new FormData();
        formData.append('file', file.buffer, file.originalname);

        const pinataMetadata = JSON.stringify({
          name: file.originalname,
          keyvalues: {
            type: metadata.type || 'evidence',
            timestamp: Date.now(),
            escrowId: metadata.escrowId || '',
            uploadedBy: metadata.uploadedBy || '',
            ...metadata.customData
          }
        });
        formData.append('pinataMetadata', pinataMetadata);

        const pinataOptions = JSON.stringify({
          cidVersion: 1
        });
        formData.append('pinataOptions', pinataOptions);

        const response = await axios.post(
          `${this.pinataUrl}/pinning/pinFileToIPFS`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${this.jwt}`,
              ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000 // 60 second timeout for large files
          }
        );

        if (!response.data?.IpfsHash) {
          throw new Error('Invalid response from Pinata API');
        }

        return {
          success: true,
          ipfsHash: response.data.IpfsHash,
          url: `https://${this.gateway}/ipfs/${response.data.IpfsHash}`,
          size: response.data.PinSize,
          timestamp: response.data.Timestamp,
          fileName: file.originalname,
          fileType: file.mimetype || 'application/octet-stream'
        };
      });
    } catch (error) {
      console.error('IPFS upload failed:', error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Pinata API credentials');
      }
      if (error.response?.status === 429) {
        throw new Error('Pinata API rate limit exceeded');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout - file may be too large');
      }
      
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload JSON data to IPFS with retry logic
   */
  async uploadJSON(data, metadata = {}) {
    try {
      return await this.retryWithBackoff(async () => {
        const payload = {
          pinataContent: data,
          pinataMetadata: {
            name: metadata.name || 'json-data',
            keyvalues: {
              type: metadata.type || 'json',
              timestamp: Date.now(),
              ...metadata.customData
            }
          },
          pinataOptions: {
            cidVersion: 1
          }
        };

        const response = await axios.post(
          `${this.pinataUrl}/pinning/pinJSONToIPFS`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${this.jwt}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        if (!response.data?.IpfsHash) {
          throw new Error('Invalid response from Pinata API');
        }

        return {
          success: true,
          ipfsHash: response.data.IpfsHash,
          url: `https://${this.gateway}/ipfs/${response.data.IpfsHash}`,
          timestamp: response.data.Timestamp
        };
      });
    } catch (error) {
      console.error('IPFS JSON upload failed:', error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Pinata API credentials');
      }
      if (error.response?.status === 429) {
        throw new Error('Pinata API rate limit exceeded');
      }
      
      throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files) {
    try {
      const uploads = await Promise.all(
        files.map(file => this.uploadFile(file))
      );

      return {
        success: true,
        files: uploads,
        count: uploads.length
      };
    } catch (error) {
      console.error('Multiple file upload failed:', error);
      throw new Error('Failed to upload multiple files');
    }
  }

  /**
   * Get file from IPFS with retry logic
   */
  async getFile(ipfsHash) {
    try {
      if (!ipfsHash) {
        throw new Error('IPFS hash is required');
      }

      return await this.retryWithBackoff(async () => {
        const response = await axios.get(
          `https://${this.gateway}/ipfs/${ipfsHash}`,
          {
            timeout: 30000,
            maxContentLength: this.maxFileSize,
            maxBodyLength: this.maxFileSize
          }
        );

        return {
          success: true,
          data: response.data,
          contentType: response.headers['content-type'],
          size: response.headers['content-length']
        };
      });
    } catch (error) {
      console.error('IPFS retrieval failed:', error.message);
      
      if (error.response?.status === 404) {
        throw new Error('File not found on IPFS');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('IPFS retrieval timeout');
      }
      
      throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
    }
  }

  /**
   * Pin existing IPFS hash
   */
  async pinByHash(ipfsHash) {
    try {
      const response = await axios.post(
        `${this.pinataUrl}/pinning/pinByHash`,
        {
          hashToPin: ipfsHash
        },
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        ipfsHash: response.data.IpfsHash
      };
    } catch (error) {
      console.error('IPFS pinning failed:', error);
      throw new Error('Failed to pin IPFS hash');
    }
  }

  /**
   * Unpin file from IPFS
   */
  async unpinFile(ipfsHash) {
    try {
      await axios.delete(
        `${this.pinataUrl}/pinning/unpin/${ipfsHash}`,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`
          }
        }
      );

      return {
        success: true,
        message: 'File unpinned successfully'
      };
    } catch (error) {
      console.error('IPFS unpinning failed:', error);
      throw new Error('Failed to unpin file');
    }
  }
}

export default IPFSService;
export { IPFSService };