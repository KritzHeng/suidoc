"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { uploadDocument } from "@/services/documentService";
import { toast } from "@/lib/toast";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createAllowlist } from "@/services/signAndExecuteService";
import { SUIDOC_PACKAGE_ID, SUIDOC_MODULE } from "@/config/constants";
import ConfirmationModal from "@/components/ConfirmationModal";

// Constants
const rpcUrl = getFullnodeUrl("testnet");
const client = new SuiClient({ url: rpcUrl });

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { account } = useSuiWallet();
  const wallet = useSuiWallet();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [capIdData, setCapIdData] = useState<{
    capId: string;
    allowlistObjectId: string;
  } | null>(null);

  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      // Create URL for preview
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  };

  // Clean up URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const registerDocument = async (allowlistId: string) => {
    if (!wallet.connected) throw new Error("Wallet not connected");

    const txb = new Transaction();

    txb.moveCall({
      target: `${SUIDOC_PACKAGE_ID}::${SUIDOC_MODULE}::register_document`,
      arguments: [txb.pure.string(allowlistId)],
    });

    txb.setGasBudget(50_000_000); // 0.05 SUI

    const result = await wallet.signAndExecuteTransaction({
      transaction: txb,
    });

    return await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEvents: true,
        showObjectChanges: true,
      },
    });
  };

  const handleInitiateUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsUploading(true);
    try {
      // Step 1: Create allowlist
      const capId = await createAllowlist(title, wallet);
      console.log("Cap ID at up:", capId);

      // Store the capId in state for use after confirmation
      setCapIdData(capId);

      // Show confirmation modal after Step 1 is complete
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error creating allowlist:", error);
      toast.error("Failed to create allowlist");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!file || !account || !capIdData) return;

    setIsUploading(true);
    try {
      // Step 2: Upload document to your service (only after confirmation)
      const uploadResponse = await uploadDocument(
        title,
        account.address,
        file,
        rpcUrl,
        capIdData.capId,
        capIdData.allowlistObjectId,
        wallet,
        client
      );

      // Step 3: Register document on blockchain
      const txResult = await registerDocument(capIdData.allowlistObjectId);

      toast.success("Document uploaded and registered successfully");
      console.log("Transaction result:", txResult);

      console.log(
        "`/documents/${capId.allowlistId}`: ",
        `/documents/${capIdData.allowlistObjectId}`
      );
      onSuccess();
      onClose();
      setTitle("");
      setFile(null);
      setShowConfirmation(false);
      setCapIdData(null);

      navigate(`/documents/${capIdData.allowlistObjectId}`);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload new document</DialogTitle>
            <DialogDescription>
              Upload a document to sign with Sui blockchain signatures.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInitiateUpload}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  placeholder="Enter document title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOCX (MAX. 10MB)
                      </p>
                    </div>
                    <Input
                      id="file"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {file && (
                  <p className="text-sm text-gray-500 truncate">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
            {file && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                {/* Image preview */}
                {file.type.startsWith("image/") && (
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="max-w-full max-h-64 object-contain border"
                  />
                )}
                {/* PDF preview */}
                {file.type === "application/pdf" && (
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    className="w-full h-64 border"
                  />
                )}
                {/* DOCX preview (download link) */}
                {file.type ===
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                  <a
                    href={previewUrl}
                    download={file.name}
                    className="text-blue-600 underline"
                  >
                    Download file {file.name}
                  </a>
                )}
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sui-teal hover:bg-sui-teal/90"
                disabled={isUploading || !title || !file || !account}
              >
                {isUploading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setCapIdData(null); // Clear the capId data if user cancels
        }}
        onConfirm={handleConfirmUpload}
        title={title}
        fileName={file?.name}
        isLoading={isUploading}
        capIdData={capIdData}
      />
    </>
  );
};

export default UploadDocumentModal;
