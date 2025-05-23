import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RawDocument, Cap, CardItem } from "@/types";
import DocumentCard from "@/components/DocumentCard";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { NETWORK, WALRUS_PACKAGE_ID } from "@/config/constants";
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import { getAllDocumentObjects } from "@/services/documentService";

const Documents = () => {
  const [rawDocs, setRawDocs] = useState<RawDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { account } = useSuiWallet();
  const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

  const getAllAllowlists = async () => {
    const res = await client.getOwnedObjects({
      owner: account?.address,
      options: {
        showContent: true,
        showType: true,
      },
      filter: {
        StructType: `${WALRUS_PACKAGE_ID}::allowlist::Cap`,
      },
    });
    const caps = res.data
      .map((obj) => {
        const fields = (obj!.data!.content as { fields: any }).fields;
        return {
          id: fields?.id.id,
          allowlist_id: fields?.allowlist_id,
        };
      })
      .filter((item) => item !== null) as Cap[];
    const cardItems: CardItem[] = await Promise.all(
      caps.map(async (cap) => {
        const allowlist = await client.getObject({
          id: cap.allowlist_id,
          options: { showContent: true },
        });
        const fields = (allowlist.data?.content as { fields: any })?.fields || {};
        return {
          cap_id: cap.id,
          allowlist_id: cap.allowlist_id,
          list: fields.list,
          name: fields.name,
        };
      }),
    );
    return cardItems;
  }

  const loadDocuments = async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      const docs = await getAllDocumentObjects(client, account.address);
      const allowlists = await getAllAllowlists();
      console.log("allowlists---:", allowlists);
      console.log("docs---:", docs);
      // Filter documents that are not allowlists and add allowlist.name in content

      const filteredDocs = docs.map((doc) => {
        const allowlist = allowlists.find(
          (allowlist) => allowlist.allowlist_id === doc.content.doc_id,
        );
        console.log("allowlist++:", allowlist);
        return {
          ...doc,
          content: {
            ...doc.content,
            name: allowlist?.name || null,
          },
        };
      });

      
      console.log("filtered docs:", filteredDocs);
      // const filteredDocs = docs.filter((doc) => {
      //   return !allowlists.some((allowlist) => allowlist.cap_id === doc.id);
      // });
      // console.log("raw docs:", docs);
      setRawDocs(filteredDocs);
    } catch (error) {
      console.error("Error fetching Sui objects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!account}
          className="bg-sui-teal hover:bg-sui-teal/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sui-teal" />
        </div>
      ) : rawDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rawDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No documents found
          </h3>
          <div className="mt-6">
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              disabled={!account}
              className="bg-sui-teal hover:bg-sui-teal/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>
        </div>
      )}

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={loadDocuments}
      />
    </div>
  );
};

export default Documents;
