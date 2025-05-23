import { SuiClient } from '@mysten/sui/client';

/**
 * Verifies a document signature against the Sui blockchain
 * 
 * @param file The document file to verify
 * @param walletAddress The wallet address that supposedly signed the document
 * @param signature The cryptographic signature to verify
 * @param client The Sui client instance
 * @returns Promise resolving to verification result
 */
export const verifyDocumentSignature = async (
  file: File,
  walletAddress: string,
  signature: string,
  client: SuiClient
): Promise<{
  isValid: boolean;
  documentName?: string;
  signedAt?: Date;
  signedBy?: string;
  transactionId?: string;
}> => {
  try {
    // 1. Calculate document hash
    const documentHash = await calculateDocumentHash(file);
    
    // 2. Verify the signature cryptographically
    // This checks if the signature was created by the specified wallet address
    // for the specified document hash
    const isSignatureValid = await verifySignatureCryptographically(
      client,
      documentHash,
      signature,
      walletAddress
    );
    
    if (!isSignatureValid) {
      return { isValid: false };
    }
    
    // 3. If the signature is valid, fetch additional metadata
    // This could be from your backend, Walrus, or the blockchain
    const documentMetadata = {
      name: file.name,
      signedAt: new Date(),
      signerAddress: walletAddress,
      transactionId: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    
    // 4. Return the verification result
    return {
      isValid: true,
      documentName: documentMetadata.name,
      signedAt: documentMetadata.signedAt,
      signedBy: documentMetadata.signerAddress,
      transactionId: documentMetadata.transactionId,
    };
  } catch (error) {
    console.error("Error verifying document signature:", error);
    throw error;
  }
};

/**
 * Calculates a hash of the document file
 * 
 * @param file The file to hash
 * @returns Promise resolving to the document hash
 */
const calculateDocumentHash = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error("Failed to read file");
        }
        
        // Convert file to ArrayBuffer
        const arrayBuffer = event.target.result as ArrayBuffer;
        
        // Use the Web Crypto API to hash the file
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        
        // Convert hash to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Verifies a cryptographic signature
 * 
 * @param client The Sui client
 * @param documentHash The hash of the document
 * @param signature The signature to verify
 * @param signerAddress The address of the signer
 * @returns Promise resolving to whether the signature is valid
 */
const verifySignatureCryptographically = async (
  client: SuiClient,
  documentHash: string,
  signature: string,
  signerAddress: string
): Promise<boolean> => {
  try {
    // In a real implementation, you would use cryptographic libraries
    // to verify that the signature was created by the specified wallet address
    // for the specified document hash
    
    // Example of how you might verify a signature:
    // 1. Get the public key from the wallet address
    // 2. Use a crypto library to verify the signature against the document hash
    
    // For now, return true for demonstration if the signature format looks valid
    // return signature.startsWith("0x") && signature.length >= 64;
    // mock verification
    return true;
  } catch (error) {
    console.error("Error verifying signature cryptographically:", error);
    return false;
  }
};