import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import {
  useWallet as useSuiWallet,
} from "@suiet/wallet-kit";
import { bcs } from "@mysten/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { SUIDOC_PACKAGE_ID, SUIDOC_MODULE } from "@/config/constants";


// Example SHA-256 hash (64 hex chars = 32 bytes)
const docHash =
  "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
const cid = "QmXYZ123"; // IPFS CID
// In a real app, you'd generate this properly using a crypto library
const signature =
  "deadbeef12345678deadbeef12345678deadbeef12345678deadbeef12345678";

interface SignatureModalProps {
  doc_id: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionId: string) => void;
  documentTitle: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  doc_id,
  isOpen,
  onClose,
  onConfirm,
  documentTitle,
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const { signMessage, account } = useSuiWallet();
  const wallet = useSuiWallet(); // Moved inside the component

  const signDocument = async () => {
    if (!wallet.connected) return;

    setIsSigning(true);
    try {
      const msgBytes = new TextEncoder().encode(docHash);

      let result = await wallet.signPersonalMessage({
        message: msgBytes,
      });
      // convert result to hex string
      const hexString = result.signature.toString("hex");

      // const doc_id = "0x1de23f8645acf310d859fd7c7163544c9d48a6ea19f67777c80d66efa41df44a"
      const txb = new Transaction();

      // const docHashBytes: any = bcs.string().serialize(docHash);
      const signatureBytes: any = bcs.string().serialize(hexString);

      txb.moveCall({
        target: `${SUIDOC_PACKAGE_ID}::${SUIDOC_MODULE}::sign_document`,
        arguments: [txb.pure.string(doc_id), txb.pure(signatureBytes)],
      });

      txb.setGasBudget(50_000_000); // 0.05 SUI

      result = await wallet.signAndExecuteTransaction({
        transaction: txb,
      });
      
      console.log("Transaction result:", result);
      onClose()
    } catch (error) {
      console.error("Signing failed:", error);
      toast.error("Failed to sign document");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sign Document</DialogTitle>
          <DialogDescription>
            You are about to sign this document using your connected wallet.
            This action will be recorded on the Sui blockchain.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-md mb-4">
            <p className="text-sm font-medium mb-2">Document</p>
            <p className="text-sm">{documentTitle}</p>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium mb-2">Wallet Signer</p>
            <p className="text-sm font-mono">{account?.address}</p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSigning}>
            Cancel
          </Button>
          <Button
            onClick={signDocument}
            disabled={isSigning || !account}
            className="bg-sui-teal hover:bg-sui-teal/90"
          >
            {isSigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;
