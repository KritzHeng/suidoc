import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import { getAllDocumentObjects } from "@/services/documentService";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { NETWORK } from "@/config/constants";

type RawDocument = {
  id: string;
  type: string;
  owner: any;
  version: number;
  digest: string;
  content?: Record<string, any>;
};

const Dashboard = () => {
  const [rawDocs, setRawDocs] = useState<RawDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { account } = useSuiWallet();
  const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

  const loadDocuments = async () => {
    if (!account) return;
    setIsLoading(true);
    try {
      const docs = await getAllDocumentObjects(client, account.address);
      setRawDocs(docs);
    } catch (error) {
      console.error("Error fetching Sui objects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [account]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!account}
          className="bg-sui-teal hover:bg-sui-teal/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      {!account ? (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
          <p className="text-blue-700 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Connect your wallet to access all features
          </p>
        </div>
      ) : null}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Recent Sui Documents</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sui-teal" />
          </div>
        ) : rawDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rawDocs.map((doc) => (
              <Card key={doc.content.doc_id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {doc.content?.title ?? doc.id}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Version: {doc.version}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(doc.content, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">ไม่พบเอกสารบน chain ครับ</p>
        )}
      </div>

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={loadDocuments}
      />
    </div>
  );
};

export default Dashboard;
