import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { UserCircle, LogOut, Wallet } from "lucide-react";
import WalletConnectDialog from "@/components/WalletConnectDialog";
import { useWallet as suiWallet, ConnectButton } from "@suiet/wallet-kit";

const Header = () => {
  const { account, disconnect } = suiWallet();
  const location = useLocation();
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-sui-navy rounded-md flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-sui-navy">SuiDoc</span>
            </Link>

            <nav className="hidden md:ml-8 md:flex space-x-8">
              {account && (
                <>
                  {/* <Link
                    to="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === "/dashboard"
                        ? "border-sui-teal text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Dashboard
                  </Link> */}
                  <Link
                    to="/documents"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname.includes("/documents")
                        ? "border-sui-teal text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Documents
                  </Link>
                  <Link
                    to="/verify"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname.includes("/verify")
                        ? "border-sui-teal text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Verify Document
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center">
            {account && account ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center text-sm text-gray-700">
                  <UserCircle className="w-5 h-5 text-sui-teal mr-1" />
                  <span>{truncateAddress(account.address)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="text-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </div>
            ) : (
              <ConnectButton className="inline-flex items-center bg-sui-teal hover:bg-sui-teal/90 w-auto px-4 py-2 text-sm font-medium rounded-md">
                <Wallet className="mr-2 h-5 w-5" />{" "}
                {/* ใช้ mr-2 แยกไอคอนกับข้อความ */}
                <span>Connect Wallet</span>
              </ConnectButton>
            )}

            <WalletConnectDialog
              open={walletDialogOpen}
              onOpenChange={setWalletDialogOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
