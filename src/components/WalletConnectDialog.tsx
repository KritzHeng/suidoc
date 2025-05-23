import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWallet } from "@suiet/wallet-kit";


interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { account, disconnect } = useWallet();

  // ถ้าต่อสำเร็จแล้ว ให้ปิด dialog อัตโนมัติ
  useEffect(() => {
    if (account) {
      onOpenChange(false);
    }
  }, [account, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader className="flex justify-between items-center pb-2">
          <DialogTitle className="text-xl font-bold mb-8">
            Connect Wallet
          </DialogTitle>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          ></Button> */}
          {/* <div className="flex justify-center">
            <ConnectButton />
          </div> */}
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-center text-sm text-gray-600">
            Please select a wallet to connect to SuiDoc
          </p>

          {/* ปุ่ม ConnectButton จะโชว์รายชื่อ wallets ให้เลือกอัตโนมัติ */}

          {/* ถ้าเชื่อมต่อแล้ว ให้แสดง Disconnect */}
          {/* {account && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-700 mb-2">
                Connected: {account.address}
              </p>
              <Button onClick={disconnect} variant="outline">
                Disconnect
              </Button>
            </div>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectDialog;
