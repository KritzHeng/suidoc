import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import keyPairJson from '../../../keypair.json';
import { bcs } from "@mysten/bcs";

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


// Register a Document
export async function registerDocument(doc_id: string) {
  const keypair = getKeypair();
  const txb = new Transaction();

  // Convert string to BCS-serialized format
  const docIdBytes = bcs.string().serialize(doc_id);
    // const cidBytes = bcs.string().serialize(cid);

  // const docIdBytes = bcs.string('string', doc_id).toBytes();

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE}::register_document`,
    arguments: [
      txb.pure(docIdBytes),
    ],
  });

  txb.setGasBudget(100_000_000); // Increased gas budget

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: txb,
    options: { 
      showEvents: true,
      showObjectChanges: true
    },
  });

  return await client.waitForTransaction({ 
    digest: result.digest,
    options: {
      showEvents: true,
      showObjectChanges: true
    }
  });
}

// Example Usage
(async () => {
  try {
    // // Example SHA-256 hash (64 hex chars = 32 bytes)
    // const docHash = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
    // const cid = "QmXYZ123"; // IPFS CID
    
    // allowlistId
    const doc_id = "0xxxx";

    console.log("Registering document...");
    const regResult = await registerDocument(doc_id);
    console.log("Registration result:", regResult);

  } catch (error) {
    console.error("Error:", error);
  }
})();