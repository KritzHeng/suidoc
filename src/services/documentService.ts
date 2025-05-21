import { Document, SignatureField, UploadedDoc } from "@/types";
import { fromHex, toHex } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SealClient, getAllowlistedKeyServers } from "@mysten/seal";
import {
  PACKAGE_ID,
  WALRUS_SERVICES,
  SUIDOC_PACKAGE_ID,
  SUIDOC_MODULE,
  NETWORK,
  WALRUS_PACKAGE_ID,
} from "@/config/constants";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/config/networkConfig";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";

import { SignatureRecord } from "@/types/index";
// Mock documents for demonstration
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

const mockDocuments: Document[] = [
  {
    id: "doc-1",
    title: "Employment Contract",
    uploadedBy: "0xuser1",
    uploadedAt: new Date("2025-03-28"),
    status: "pending",
    signatureFields: [
      {
        id: "sig-1",
        x: 100,
        y: 400,
        width: 200,
        height: 60,
      },
    ],
    sharedWith: [],
  },
  {
    id: "doc-2",
    title: "NDA Agreement",
    uploadedBy: "0xuser1",
    uploadedAt: new Date("2025-03-30"),
    status: "draft",
    signatureFields: [],
    sharedWith: [],
  },
  {
    id: "0x1de23f8645acf310d859fd7c7163544c9d48a6ea19f67777c80d66efa41df44a",
    title: "NDA Agreement",
    uploadedBy: "0xuser1",
    uploadedAt: new Date("2025-03-30"),
    status: "draft",
    signatureFields: [],
    sharedWith: [],
  },
  {
    id: "0x2c0698cb2f3b3fa131defa1bfe9077c13c61f3c24d75f93d4a7659ce34e82678",
    title: "NDA Agreement",
    uploadedBy: "0xuser1",
    uploadedAt: new Date("2025-03-30"),
    status: "draft",
    signatureFields: [],
    sharedWith: [],
  },
];

export async function getAllDocumentObjects(
  clent: any,
  ownerAddress: string
): Promise<any[]> {
  try {
    // const keypair = getKeypair();
    // const ownerAddress = keypair.getPublicKey().toSuiAddress();

    // Correct way to filter for specific type in newer SDK versions
    const objects = await clent.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: `${SUIDOC_PACKAGE_ID}::${SUIDOC_MODULE}::Document`,
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    // Process and return the documents
    return objects.data.map((obj) => {
      if (!obj.data) {
        throw new Error("Object data missing");
      }

      return {
        id: obj.data.objectId,
        type: obj.data.type,
        owner: obj.data.owner,
        version: obj.data.version,
        digest: obj.data.digest,
        content:
          obj.data.content?.dataType === "moveObject"
            ? obj.data.content.fields
            : undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}

/**
 * Fetches the signature history for a document
 *
 * @param documentId The ID of the document
 * @returns Promise resolving to an array of signature records
 */
export const getDocumentSignatureHistory = async (
  documentId: string
): Promise<SignatureRecord[]> => {
  try {
    // In a real implementation, you would fetch this data from your backend or blockchain
    // For now, return mock data for demonstration
    // Example:
    // return [
    //   {
    //     signerAddress: "0x4543...4be8",
    //     signature: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    //     timestamp: Date.now() - 86400000, // 1 day ago
    //     transactionId: "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234"
    //   },
    //   {
    //     signerAddress: "0x9876...5432",
    //     signature: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    //     timestamp: Date.now() - 172800000, // 2 days ago
    //     transactionId: "0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcde"
    //   }
    // ];
    console.log("documentId:", documentId);
    const eventFilter = {
      MoveModule: {
        package: SUIDOC_PACKAGE_ID,
        module: SUIDOC_MODULE,
      },
    };
    try {
      const events = await client.queryEvents({
        query: eventFilter,
        limit: 100,
        order: "descending",
      });

      return events.data
        .filter((event) => {
          const eventData = event.parsedJson as any;
          return (
            JSON.stringify(eventData.doc_id) === JSON.stringify(documentId) &&
            event.type.endsWith("DocumentSignedEvent")
          );
        })
        .map((event) => {
          const eventData = event.parsedJson as any;

          // Convert the signature array to a hex string (if needed)
          const signatureBytes = new Uint8Array(eventData.signature);
          const signatureHex = Array.from(signatureBytes)
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");

          return {
            signerAddress: eventData.signer,
            signature: `0x${signatureHex}`, // or use eventData.signature directly if it's already formatted
            timestamp: Number(event.timestampMs), // Convert string timestamp to number
            transactionId: event.id.txDigest,
          };
        });
    } catch (error) {
      console.error("Error fetching signature history:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error fetching signature history:", error);
    throw error;
  }
};

export const getDocuments = async (): Promise<Document[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [...mockDocuments];
};

export const getDocumentById = async (
  id: string,
  document: Document | undefined = undefined
): Promise<Document | undefined> => {
  // Simulate API call delay
  // await new Promise((resolve) => setTimeout(resolve, 500));
  // return (

  // );
  return mockDocuments.find((doc) => doc.id === id);
};

export const addSignatureField = async (
  documentId: string,
  field: Omit<SignatureField, "id">
): Promise<SignatureField> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newField: SignatureField = {
    ...field,
    id: `sig-${Date.now()}`,
  };

  // In a real app, this would update the backend
  const docIndex = mockDocuments.findIndex((doc) => doc.id === documentId);
  if (docIndex >= 0) {
    mockDocuments[docIndex].signatureFields.push(newField);
  }

  return newField;
};

export const signDocument = async (
  documentId: string,
  fieldId: string,
  signerAddress: string,
  transactionId: string
): Promise<boolean> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real app, this would update the backend
  const docIndex = mockDocuments.findIndex((doc) => doc.id === documentId);
  if (docIndex >= 0) {
    const fieldIndex = mockDocuments[docIndex].signatureFields.findIndex(
      (field) => field.id === fieldId
    );
    if (fieldIndex >= 0) {
      mockDocuments[docIndex].signatureFields[fieldIndex].signedBy =
        signerAddress;
      mockDocuments[docIndex].signatureFields[fieldIndex].signedAt = new Date();
      mockDocuments[docIndex].signatureFields[fieldIndex].transactionId =
        transactionId;

      // Check if all fields are signed
      const allSigned = mockDocuments[docIndex].signatureFields.every(
        (field) => field.signedBy
      );
      if (allSigned) {
        mockDocuments[docIndex].status = "completed";
      } else {
        mockDocuments[docIndex].status = "signed";
      }

      return true;
    }
  }

  return false;
};

export type UploadResult = {
  document: Document;
  previewDataUrl: string; // <— คืน Data URL สำหรับพรีวิว
};

export type Data = {
  status: string;
  blobId: string;
  endEpoch: string;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  suiUrl: string;
  isImage: string;
};
export const uploadDocument = async (
  title: string,
  uploadedBy: string,
  file: File,
  rpcUrl: string,
  cap_id: string,
  allowlistId: string,
  wallet: any,
  client: any,
  walrusServiceId: string = WALRUS_SERVICES[0].id
): Promise<Document> => {
  // Constants
  const SUI_VIEW_TX_URL = `https://suiscan.xyz/testnet/tx`;
  const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/testnet/object`;
  const NUM_EPOCH = 1;

  // Initialize clients
  const suiClient = new SuiClient({ url: rpcUrl });
  const sealClient = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });

  // Helper functions
  const getServiceUrl = (
    type: "aggregator" | "publisher",
    path: string
  ): string => {
    const service = WALRUS_SERVICES.find((s) => s.id === walrusServiceId);
    if (!service) throw new Error(`Service ${walrusServiceId} not found`);

    const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
    const baseUrl =
      type === "aggregator" ? service.aggregatorUrl : service.publisherUrl;
    return `${baseUrl}/v1/${cleanPath}`;
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  const validateFileType = async (file: File, data: Uint8Array) => {
    if (file.type === "application/pdf") {
      const header = new TextDecoder().decode(data.slice(0, 5));
      console.log("PDF header:", header);
    }

    if (file.name.endsWith(".docx")) {
      const magic = Array.from(data.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      console.log("DOCX magic bytes:", magic);
    }

    if (file.type.startsWith("image/")) {
      const dataUrl = await readFileAsDataUrl(file);
      console.log("Image preview Data URL:", dataUrl.slice(0, 100));
    }
  };

  const storeBlob = async (
    encryptedData: Uint8Array
  ): Promise<{ info: any }> => {
    const response = await fetch(
      getServiceUrl("publisher", `/v1/blobs?epochs=${NUM_EPOCH}`),
      {
        method: "PUT",
        body: encryptedData,
      }
    );

    if (response.status !== 200) {
      throw new Error(
        "Error publishing the blob on Walrus, please select a different Walrus service."
      );
    }

    return response.json().then((info) => ({ info }));
  };

  const displayUpload = async (
    storageInfo: any,
    mediaType: string
  ): Promise<Data> => {
    let info: Data;

    if ("alreadyCertified" in storageInfo) {
      info = {
        status: "Already certified",
        blobId: storageInfo.alreadyCertified.blobId,
        endEpoch: storageInfo.alreadyCertified.endEpoch,
        suiRefType: "Previous Sui Certified Event",
        suiRef: storageInfo.alreadyCertified.event.txDigest,
        suiBaseUrl: SUI_VIEW_TX_URL,
        blobUrl: getServiceUrl(
          "aggregator",
          `/v1/blobs/${storageInfo.alreadyCertified.blobId}`
        ),
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storageInfo.alreadyCertified.event.txDigest}`,
        isImage: mediaType.startsWith("image"),
      };
    } else if ("newlyCreated" in storageInfo) {
      info = {
        status: "Newly created",
        blobId: storageInfo.newlyCreated.blobObject.blobId,
        endEpoch: storageInfo.newlyCreated.blobObject.storage.endEpoch,
        suiRefType: "Associated Sui Object",
        suiRef: storageInfo.newlyCreated.blobObject.id,
        suiBaseUrl: SUI_VIEW_OBJECT_URL,
        blobUrl: getServiceUrl(
          "aggregator",
          `/v1/blobs/${storageInfo.newlyCreated.blobObject.blobId}`
        ),
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storageInfo.newlyCreated.blobObject.id}`,
        isImage: mediaType.startsWith("image"),
      };
    } else {
      throw new Error("Unhandled successful response!");
    }

    console.log("Storage info:", info);
    return info;
  };

  const encryptAndStoreFile = async (file: File): Promise<Data> => {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const nonce = crypto.getRandomValues(new Uint8Array(5));
    const policyObjectBytes = fromHex(allowlistId);
    const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

    const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
      threshold: 2,
      packageId: WALRUS_PACKAGE_ID,
      id,
      data: new Uint8Array(arrayBuffer),
    });

    const storageInfo = await storeBlob(encryptedBytes);
    return displayUpload(storageInfo.info, file.type);
  };

  const publishToBlockchain = async (blobId: string) => {
    const txp = new Transaction();
    txp.moveCall({
      target: `${WALRUS_PACKAGE_ID}::allowlist::publish`,
      arguments: [
        txp.object(allowlistId),
        txp.object(cap_id),
        txp.pure.string(blobId),
      ],
    });
    txp.setGasBudget(10000000);

    const resultPublish = await wallet.signAndExecuteTransaction({
      transaction: txp,
    });

    return client.waitForTransaction({
      digest: resultPublish.digest,
      options: {
        showEvents: true,
        showObjectChanges: true,
      },
    });
  };

  // Main execution
  try {
    // Read and validate file
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);
    await validateFileType(file, data);

    // Process file
    const info = await encryptAndStoreFile(file);
    console.log("Blob ID:", info.blobId);
    console.log("allowlistId:", allowlistId);
    console.log("cap_id:", cap_id);

    // Publish to blockchain
    await publishToBlockchain(info.blobId);

    // Create and return document
    const newDoc: Document & { walrusBlobId?: string } = {
      id: allowlistId,
      title,
      uploadedBy,
      uploadedAt: new Date(),
      status: "draft",
      signatureFields: [],
      sharedWith: [],
      walrusBlobId: info.blobId,
    };

    mockDocuments.push(newDoc);
    console.log("New document:", newDoc);
    return newDoc;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

export const shareDocument = async (
  documentId: string,
  addresses: string[]
): Promise<boolean> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const docIndex = mockDocuments.findIndex((doc) => doc.id === documentId);
  if (docIndex >= 0) {
    // Add unique addresses only
    const currentShared = mockDocuments[docIndex].sharedWith || [];
    const uniqueAddresses = [...new Set([...currentShared, ...addresses])];

    // Update the document
    mockDocuments[docIndex].sharedWith = uniqueAddresses;

    return true;
  }

  return false;
};
