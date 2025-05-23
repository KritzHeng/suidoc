import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { bcs } from '@mysten/bcs';
import keyPairJson from '../../../keypair.json';

// Configuration
const PACKAGE_ID = "";
const MODULE = "document";
const NETWORK = "testnet";

// Initialize client
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

// Helper to get keypair from private key
function getKeypair(): Ed25519Keypair {
  const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
  return Ed25519Keypair.fromSecretKey(secretKey);
}

// Sign a Document
export async function signDocument(docHash: string, signature: string) {
  const keypair = getKeypair();
  const txb = new Transaction();

  // Convert and serialize using proper BCS methods
  // const docHashBytes = bcs.hex().serialize(docHash);
  // const signatureBytes = bcs.hex().serialize(signature);
  // bcs.string().serialize('a').toBytes()
  const docHashBytes = bcs.string().serialize(docHash);
  const signatureBytes = bcs.string().serialize(signature);

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE}::sign_document`,
    arguments: [
      txb.pure(docHashBytes),
      txb.pure(signatureBytes),
    ],
  });

  txb.setGasBudget(50_000_000); // 0.05 SUI

  return client.signAndExecuteTransaction({
    signer: keypair,
    transaction: txb,
    options: { showEvents: true },
  });
}

export async function getDocumentEvents(docHash?: string) {
  const eventFilter = {
    MoveModule: {
      package: PACKAGE_ID,
      module: MODULE,
    },
  };

  const events = await client.queryEvents({
    query: eventFilter,
    limit: 100,
    order: 'descending',
  });

  // Log just the parsedJson from each event
  console.log("Parsed JSON from events:", events.data.map(event => event.parsedJson));

  if (!docHash) return events.data;
  
  const hashBytes = Array.from(Buffer.from(docHash, 'hex'));
  return events.data.filter(event => {
    const eventData = event.parsedJson as any;
    return (
      JSON.stringify((eventData?.doc_hash)) === JSON.stringify(hashBytes)
    );
  });
}

// Example Usage
(async () => {
  try {
    // Example SHA-256 hash (64 hex chars = 32 bytes)
    const docHash = "";

    // In a real app, you'd generate this properly using a crypto library
    const signature = "";

    console.log("Signing document...");
    const signResult = await signDocument(docHash, signature);
    console.log("Signing result:", signResult);
  } catch (error) {
    console.error("Error:", error);
  }
})();