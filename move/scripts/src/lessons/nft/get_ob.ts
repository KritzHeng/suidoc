import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import keyPairJson from '../../../keypair.json';

// Configuration
const PACKAGE_ID = "";
const MODULE = "document";
const NETWORK = "testnet";

// Initialize client
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

// Add this interface at the top of your file (after imports)
interface DocumentContent {
  doc_hash: string;
  cid: string;
  owner: string;
  id: {
    id: string;
  };
}

interface SuiDocument {
  id: string;
  type: string;
  owner: any; // You can define a more specific type if needed
  content?: {
    dataType: "moveObject";
    type: string;
    hasPublicTransfer: boolean;
    fields: DocumentContent;
  };
  version: string;
  digest: string;
}

// Helper to get keypair from private key
function getKeypair(): Ed25519Keypair {
  const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
  return Ed25519Keypair.fromSecretKey(secretKey);
}

// Helper to convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // Optional: Add '0x' prefix version
  function bytesToHexWithPrefix(bytes: Uint8Array): string {
    return '0x' + bytesToHex(bytes);
  }

// Helper to convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}
async function getAllDocumentObjects() {
    try {
      const keypair = getKeypair();
      const ownerAddress = keypair.getPublicKey().toSuiAddress();
  
      // Correct way to filter for specific type in newer SDK versions
      const objects = await client.getOwnedObjects({
        owner: ownerAddress,
        filter: {
          StructType: `${PACKAGE_ID}::${MODULE}::Document`
        },
        options: {
          showContent: true,
          showType: true,
          showOwner: true
        }
      });
  
      // Process and return the documents
      return objects.data.map(obj => {
        if (!obj.data) {
          throw new Error("Object data missing");
        }
  
        return {
          id: obj.data.objectId,
          type: obj.data.type,
          owner: obj.data.owner,
          version: obj.data.version,
          digest: obj.data.digest,
          content: obj.data.content?.dataType === "moveObject" 
            ? obj.data.content.fields 
            : undefined
        };
      });
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  }
// Updated getDocumentObject function
async function getDocumentObject(documentId: string): Promise<SuiDocument> {
  try {
    const document = await client.getObject({
      id: documentId,
      options: {
        showContent: true,
        showOwner: true,
        showType: true
      }
    });

    console.log("Document:", document);
    if (document.error) {
      throw new Error(`Failed to fetch document: ${document.error.code}`);
    }

    const expectedType = `${PACKAGE_ID}::${MODULE}::Document`;
    if (document.data?.type !== expectedType) {
      throw new Error(`Object is not a Document (expected ${expectedType}, got ${document.data?.type})`);
    }

    return {
      id: document.data.objectId,
      type: document.data.type,
      owner: document.data.owner,
      version: document.data.version,
      digest: document.data.digest
    };
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
}


// Example Usage
(async () => {
try {
    console.log("Fetching all Document objects...");
    const documents = await getAllDocumentObjects();
    
    console.log(`Found ${documents.length} Document(s):`);
    documents.forEach((doc: any, index) => {
    //   console.log(`\nDocument #${index + 1}:`);
    //   console.log("ID:", doc.id);
    //   console.log("Type:", doc.type);
      
      if (doc.content.doc_id) {
        console.log("Content:", doc);
        // convert doc_hash and cid from Bytes to hex
        // const docHashBytes = bytesToHex(doc.content.doc_hash);
        // const cidBytes = bytesToHex(doc.content.cid);
        
        // console.log("Document Hash (bytes):", docHashBytes);
        // console.log("CID (bytes):", cidBytes);
      } else {
        console.log("Content not available");
      }
      
    //   console.log("Owner:", doc.owner);
    //   console.log("Version:", doc.version);
    });

    // show information of all documents
    console.log("\nAll Document objects fetched successfully.");


  } catch (error) {
    console.error("Error:", error);
  }
  
})();