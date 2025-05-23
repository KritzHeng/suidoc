export interface WalletAccount {
  address: string;
  publicKey: string;
}

export type RawDocument = {
  id: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  owner: any;
  version: number;
  digest: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: Record<string, any>;
};

export interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signedBy?: string;
  signedAt?: Date;
  transactionId?: string;
  blobId?: string; // ID of the blob in Walrus
}

export interface UploadedDoc {
  title: string;
  blobId: string;
  uploadedAt: Date;
}

export interface SignatureRecord {
  signerAddress: string;
  signature: string;
  timestamp: number;
  transactionId: string;
}

// Update your Document interface if needed
export interface Document {
  id: string;
  title: string;
  status: "draft" | "pending" | "signed" | "completed";
  uploadedBy: string;
  sharedWith?: string[];
  // Add other document properties
}

export interface Cap {
  id: string;
  allowlist_id: string;
}

export interface CardItem {
  cap_id: string;
  allowlist_id: string;
  list: string[];
  name: string;
}