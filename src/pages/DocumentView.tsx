import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Document, SignatureRecord } from "@/types";
import {
  getDocumentById,
  shareDocument,
  getDocumentSignatureHistory,
} from "@/services/documentService";
import {
  ArrowLeft,
  Loader2,
  FileText,
  CheckCircle2,
  Pen,
  Share2,
  Users,
  History,
  Clock,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import DocumentViewer from "@/components/DocumentViewer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import ShareModal from "@/components/ShareModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NETWORK } from "@/config/constants";
import { sign } from "crypto";
import {
  addToAllowlist,
  isInAllowlist,
} from "@/services/signAndExecuteService";

const DocumentView = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [signatureHistory, setSignatureHistory] = useState<SignatureRecord[]>(
    []
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const navigate = useNavigate();
  const { account, connected } = useSuiWallet();
  const wallet = useSuiWallet();

  const loadDocument = async () => {
    if (!id) return;

    const isallow = await isInAllowlist(id, wallet);
    const doc = await getDocumentById(id);
    console.log("isallow:", isallow);
    if (isallow) {
      setIsLoading(true);
      try {
        if (doc) {
          setDocument(doc);
          // Load signature history after document is loaded
          loadSignatureHistory();
        } else {
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setDocument(null);
      setIsLoading(false);

      addToAllowlist(id, wallet);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  };

  const loadSignatureHistory = async () => {
    if (!id) return;

    try {
      const signature_fetch = await getDocumentSignatureHistory(id);
      // check the new signature history with signatureHistory to set the new signature history
      // const history = signature_fetch.filter((record) => {
      //   return !signatureHistory.some((existingRecord) => existingRecord.transactionId === record.transactionId);
      // });
      // setSignatureHistory(history);
      console.log("signatureHistory", signatureHistory);
      console.log(
        "ssssss",
        signature_fetch.filter((record) => {
          return !signatureHistory.some(
            (existingRecord) =>
              existingRecord.transactionId !== record.transactionId
          );
        })
      );
      // check if signature_fetch i)s new for signatureHistory
      if (
        signature_fetch.filter((record) => {
          return signatureHistory.some(
            (existingRecord) =>
              existingRecord.transactionId !== record.transactionId
          );
        })
      ) {
        setIsLoadingHistory(true);
        setSignatureHistory(signature_fetch);
      }
    } catch (error) {
      console.error("Error fetching signature history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadDocument();
    // Set up interval
    const intervalId = setInterval(loadSignatureHistory, 3000);

    return () => clearInterval(intervalId);
  }, [id]);

  const getStatusIndicator = () => {
    if (!document) return null;

    const statusColors = {
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      signed: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
    };

    const statusClass = statusColors[document.status];

    return (
      <div
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
      >
        {document.status === "completed" && (
          <CheckCircle2 className="w-3 h-3 mr-1" />
        )}
        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
      </div>
    );
  };

  const canShare = () => {
    if (!document || !account) return false;
    // Only the document uploader can share it
    return document.uploadedBy === account.address;
  };

  const isShared = () => {
    if (!document) return false;
    return !!document.sharedWith && document.sharedWith.length > 0;
  };

  const handleShareDocument = async (addresses: string[]) => {
    if (!document || !id) return;

    try {
      await shareDocument(id, addresses);
      toast.success("Document shared successfully");
      loadDocument();
      // Reload document to get updated sharing status
    } catch (error) {
      console.error("Error sharing document:", error);
      toast.error("Failed to share document");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const openExplorer = (transactionId: string) => {
    window.open(
      `https://explorer.sui.io/txblock/${transactionId}?network=${NETWORK}`,
      "_blank"
    );
  };

  return (
    <div className="p-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sui-teal" />
        </div>
      ) : document ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-sui-teal mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">
                {document.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusIndicator()}

              {account && (
                <div className="flex items-center space-x-2">
                  {canShare() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex items-center"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  )}

                  {isShared() && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Users className="w-4 h-4 text-sui-teal mr-1" />
                      <span>{document.sharedWith?.length}</span>
                    </div>
                  )}

                  {document.status !== "completed" && (
                    <Tabs
                      value={mode}
                      onValueChange={(value) =>
                        setMode(value as "view" | "edit")
                      }
                      className="w-[200px]"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="view">View</TabsTrigger>
                        <TabsTrigger value="edit">
                          <Pen className="w-3 h-3 mr-1" />
                          Sign
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                </div>
              )}
            </div>
          </div>

          {!account && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
              <p className="text-blue-700">
                Connect your wallet to sign this document
              </p>
            </div>
          )}

          {/* Two-column layout for document and signature history */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Document viewer column - takes 2/3 of the space on large screens */}
            <div className="lg:w-2/3">
              <DocumentViewer
                doc_id={id}
                document={document}
                onDocumentUpdate={loadDocument}
                editMode={mode === "edit" && connected}
              />
            </div>

            {/* Signature history column - takes 1/3 of the space on large screens */}
            <div className="lg:w-1/3">
              <Card className="sticky top-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <History className="h-5 w-5 text-sui-teal mr-2" />
                    Signature History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-sui-teal" />
                    </div>
                  ) : signatureHistory.length > 0 ? (
                    <div className="space-y-4">
                      {signatureHistory.map((record, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                              <span className="font-medium">Signed by</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 text-gray-400 mr-1" />
                              <span>
                                {new Date(record.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center mb-2">
                            <span className="font-mono text-sm">
                              {formatAddress(record.signerAddress)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 ml-1"
                              onClick={() =>
                                copyToClipboard(record.signerAddress)
                              }
                            >
                              <Copy className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>

                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-1">
                              Transaction ID:
                            </div>
                            <div className="flex items-center">
                              <span className="font-mono text-xs truncate max-w-[200px]">
                                {record.transactionId}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-1"
                                onClick={() =>
                                  copyToClipboard(record.transactionId)
                                }
                              >
                                <Copy className="h-3 w-3 text-gray-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-1"
                                onClick={() =>
                                  openExplorer(record.transactionId)
                                }
                              >
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Signature:
                            </div>
                            <div className="flex items-center">
                              <div className="font-mono text-xs bg-gray-50 p-2 rounded overflow-x-auto max-w-full">
                                {record.signature.length > 20
                                  ? `${record.signature.substring(0, 20)}...`
                                  : record.signature}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 ml-1 flex-shrink-0"
                                onClick={() =>
                                  copyToClipboard(record.signature)
                                }
                              >
                                <Copy className="h-3 w-3 text-gray-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <History className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p>No signature history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            onConfirm={handleShareDocument}
            currentShares={document.sharedWith || []}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p>Document not found</p>
        </div>
      )}
    </div>
  );
};

export default DocumentView;
