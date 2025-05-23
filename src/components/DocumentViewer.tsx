import { format } from "date-fns";
import { toast } from "@/lib/toast";
import { fromHex } from '@mysten/sui/utils';
import SignatureModal from "./SignatureModal";
import { useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Document, SignatureField } from "@/types";
import { FileSignature, Check, X } from "lucide-react";
import { signDocument } from "@/services/documentService";
import React, { useState, useRef, useEffect } from "react";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WALRUS_PACKAGE_ID, NETWORK } from "@/config/constants";
import { downloadAndDecrypt, MoveCallConstructor } from '@/lib/utils';
import { getAllowlistedKeyServers, SealClient, SessionKey } from '@mysten/seal';

const x = new SuiClient({ url: getFullnodeUrl(NETWORK) });

const TTL_MIN = 10;

export interface FeedData {
  allowlistId: string;
  allowlistName: string;
  blobIds: string[];
}

function constructMoveCall(packageId: string, allowlistId: string): MoveCallConstructor {
  return (tx: Transaction, id: string) => {
    tx.moveCall({
      target: `${packageId}::allowlist::seal_approve`,
      arguments: [tx.pure.vector('u8', fromHex(id)), tx.object(allowlistId)],
    });
  };
}
interface DocumentViewerProps {
  doc_id: string;
  document: Document;
  onDocumentUpdate: () => void;
  editMode: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  doc_id,
  document,
  onDocumentUpdate,
  editMode,
}) => {
  const { account, connected } = useSuiWallet();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const [pendingField, setPendingField] =
    useState<Partial<SignatureField> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wallet = useSuiWallet();

  const [feed, setFeed] = useState<FeedData>();
  const [decryptedFileUrls, setDecryptedFileUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionKey, setCurrentSessionKey] = useState<SessionKey | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // const suiClient = useSuiClient();
  const suiClient = useSuiClient();
  const client = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers(NETWORK),
    verifyKeyServers: false,
  });

  useEffect(() => {
    console.log("DocumentViewer mounted", doc_id);

    async function getFeedAndView() {
      console.log("getFeedAndView called");
      const feedData = await getFeed();
      await onView(feedData.blobIds, feedData.allowlistId);
    }

    // Run initial load immediately
    getFeedAndView();

    // Set up interval
    const intervalId = setInterval(getFeed, 3000);

    return () => clearInterval(intervalId);
  }, [doc_id, suiClient, WALRUS_PACKAGE_ID])

  async function getFeed() {
    const allowlist = await suiClient.getObject({
      id: doc_id!,
      options: { showContent: true },
    });
    const encryptedObjects = await suiClient
      .getDynamicFields({
        parentId: doc_id!,
      })
      .then((res) => res.data.map((obj) => obj.name.value as string));
    const fields = (allowlist.data?.content as { fields: any })?.fields || {};
    const feedData = {
      allowlistId: doc_id!,
      allowlistName: fields?.name,
      blobIds: encryptedObjects,
    };
    console.log("feedData:", feedData);
    await setFeed(feedData);
    return feedData;
  }

  const onView = async (blobIds: string[], allowlistId: string) => {
    console.log("onView called");
    console.log('blobIds:', blobIds);
    console.log('allowlistId:', allowlistId);
    if (blobIds.length === 0) {
      setError('No files found for this allowlist.');
      return;
    }

    if (
      currentSessionKey &&
      !currentSessionKey.isExpired() &&
      currentSessionKey.getAddress() === account.address
    ) {
      const moveCallConstructor = constructMoveCall(WALRUS_PACKAGE_ID, allowlistId);
      downloadAndDecrypt(
        blobIds,
        currentSessionKey,
        suiClient,
        client,
        moveCallConstructor,
        setError,
        setDecryptedFileUrls,
        setIsDialogOpen,
        setReloadKey,
      );
      return;
    }

    setCurrentSessionKey(null);

    const sessionKey = new SessionKey({
      address: account.address,
      packageId: WALRUS_PACKAGE_ID,
      ttlMin: TTL_MIN,
    });

    try {
      wallet.signPersonalMessage(
        {
          message: sessionKey.getPersonalMessage(),
        },
      ).then(async (result) => {
        await sessionKey.setPersonalMessageSignature(result.signature);
        const moveCallConstructor = constructMoveCall(WALRUS_PACKAGE_ID, allowlistId);
        await downloadAndDecrypt(
          blobIds,
          sessionKey,
          suiClient,
          client,
          moveCallConstructor,
          setError,
          setDecryptedFileUrls,
          setIsDialogOpen,
          setReloadKey,
        );
        setCurrentSessionKey(sessionKey);
      }
      );
    } catch (error: any) {
      console.error('Error:', error);
    }
  };


  const handleFieldClick = (fieldId: string) => {
    if (!connected) {
      toast.error("Please connect your wallet to sign");
      return;
    }

    // Find the field
    const field = document.signatureFields.find(
      (field) => field.id === fieldId
    );

    // Check if field is already signed
    if (field && field.signedBy) {
      toast.info(`Already signed by ${field.signedBy}`);
      return;
    }

    setActiveFieldId(fieldId);
    setIsSignModalOpen(true);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // if (!editMode || !isAddingSignature || !containerRef.current) return;

    // // Get click coordinates relative to the container
    // const rect = containerRef.current.getBoundingClientRect();
    // const x = e.clientX - rect.left;
    // const y = e.clientY - rect.top;

    // // Create a new signature field at this position
    // const newField: Partial<SignatureField> = {
    //   id: nanoid(),
    //   x,
    //   y,
    //   width: 200,
    //   height: 60,
    // };

    // setPendingField(newField);
    setIsAddingSignature(false);
    // setActiveFieldId(newField.id as string);
    setIsSignModalOpen(true);
  };

  const handleSignConfirm = async (transactionId: string) => {
    setIsProcessing(true);
    try {
      if (pendingField && account) {
        // This is a new field
        const newField = {
          ...pendingField,
          signedBy: account.address,
          signedAt: new Date(),
          transactionId,
        } as SignatureField;

        // In a real app, we'd update the document on the backend
        // For now, we'll just simulate this
        document.signatureFields.push(newField as SignatureField);
        document.status =
          document.signatureFields.length >= 2 ? "completed" : "signed";

        toast.success("Document signed successfully");
        setPendingField(null);
        onDocumentUpdate();
      } else if (activeFieldId && account) {
        // This is an existing field
        const success = await signDocument(
          document.id,
          activeFieldId,
          account.address,
          transactionId
        );

        if (success) {
          onDocumentUpdate();
        }
      }
    } catch (error) {
      console.error("Error signing document:", error);
      toast.error("Failed to sign document");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAddSignature = () => {
    setIsAddingSignature(false);
    setPendingField(null);
  };

  return (
    <div className="relative mb-8">
      {editMode && (
        <div className="flex items-center justify-between bg-gray-50 p-3 mb-4 rounded-md border border-gray-200">
          <div className="text-sm">
            {isAddingSignature ? (
              <span className="text-sui-teal font-medium flex items-center">
                <FileSignature className="w-4 h-4 mr-1" />
                Click anywhere on the document to add your signature
              </span>
            ) : (
              <span>Click "Add Signature" to sign the document</span>
            )}
          </div>
          <div className="flex space-x-2">
            {isAddingSignature ? (
              <Button variant="outline" size="sm" onClick={cancelAddSignature}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            ) : (
              <Button
                className="bg-sui-teal hover:bg-sui-teal/90"
                size="sm"
                onClick={handleContainerClick}
              >
                <FileSignature className="w-4 h-4 mr-1" />
                Add Signature
              </Button>
            )}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className={`doc-container ${isAddingSignature ? "cursor-crosshair" : ""
          }`}
        // onClick={handleContainerClick}
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          {document.title}
        </h1>
        {decryptedFileUrls.map((decryptedFileUrl, index) => (
          <div key={index} style={{ height: '1000px', marginBottom: '20px' }}>
            <iframe
              src={decryptedFileUrl}
              title={`Decrypted PDF ${index + 1}`}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
        ))}

        {document.signatureFields.map((field) => (
          <div
            key={field.id}
            className={`signature-field ${field.signedBy ? "signed" : ""}`}
            style={{
              top: `${field.y}px`,
              left: `${field.x}px`,
              width: `${field.width}px`,
              height: `${field.height}px`,
              pointerEvents: isAddingSignature ? "none" : "auto", // Disable pointer events when adding new signature
            }}
            onClick={(e) => {
              e.stopPropagation();
              !field.signedBy && handleFieldClick(field.id);
            }}
          >
            {field.signedBy ? (
              <div className="flex flex-col items-center justify-center w-full h-full p-2">
                <div className="flex items-center justify-center mb-1">
                  <Check className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    Signed
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  <div className="font-mono truncate max-w-full">
                    {field.signedBy}
                  </div>
                  {field.signedAt && (
                    <div>{format(field.signedAt, "MMM d, yyyy")}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-sui-teal mr-1" />
                <span className="text-sm text-sui-teal">Click to sign</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {connected && account && (
        <SignatureModal
          doc_id={doc_id}
          isOpen={isSignModalOpen}
          onClose={() => {
            setIsSignModalOpen(false);
            setPendingField(null);
            setActiveFieldId(null);
          }}
          onConfirm={handleSignConfirm}
          documentTitle={document.title}
        />
      )}
    </div>
  );
};

export default DocumentViewer;
