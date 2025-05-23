"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWallet as useSuiWallet } from "@suiet/wallet-kit"
import { FileCheck, Upload, CheckCircle, XCircle, Loader2, FileText, Search } from "lucide-react"
import { toast } from "@/lib/toast"
import { verifyDocumentSignature } from "@/services/verificationService"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import { NETWORK } from "@/config/constants"

const VerifySignature = () => {
  const [file, setFile] = useState<File | null>(null)
  const [walletAddress, setWalletAddress] = useState("")
  const [signature, setSignature] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    status: "success" | "error"
    documentName?: string
    signedAt?: string
    signedBy?: string
    transactionId?: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { account } = useSuiWallet()
  const client = new SuiClient({ url: getFullnodeUrl(NETWORK) })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // Reset verification result when file changes
      setVerificationResult(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      // Reset verification result when file changes
      setVerificationResult(null)
    }
  }

  const handleVerify = async () => {
    if (!file || !walletAddress || !signature) {
      toast.error("Please provide document, wallet address, and signature")
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      // This line calls the verification service
      const result = await verifyDocumentSignature(file, walletAddress, signature, client)

      if (result.isValid) {
        setVerificationResult({
          status: "success",
          documentName: result.documentName,
          signedAt: result.signedAt?.toLocaleString(),
          signedBy: result.signedBy,
          transactionId: result.transactionId,
        })
        toast.success("Signature verified successfully")
      } else {
        setVerificationResult({
          status: "error",
        })
        toast.error("Signature verification failed")
      }
    } catch (error) {
      console.error("Error verifying signature:", error)
      setVerificationResult({
        status: "error",
      })
      toast.error("Error verifying signature")
    } finally {
      setIsVerifying(false)
    }
  }
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <FileCheck className="h-6 w-6 text-sui-teal mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">
            Verify Document Signature{' '}
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">
              (Preview Mode)
            </span>
          </h1>

        </div>
        <span className="text-sm text-gray-500 ml-2 text-red-700">
          (This is a preview mode. The verification signature will always be valid.)
        </span>

        <Card className="mt-5 mb-6">
          <CardHeader>
            <CardTitle>Document Verification</CardTitle>
            <CardDescription>
              Verify the authenticity of a document signature using the document file, the signer's Sui wallet address,
              and the signature.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx"
                  />

                  {file ? (
                    <div className="flex items-center justify-center">
                      <FileText className="h-5 w-5 text-sui-teal mr-2" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                          setVerificationResult(null)
                        }}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Drag and drop your document here, or click to browse</p>
                      <p className="text-xs text-gray-400">PDF, DOCX (MAX. 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signer's Sui Wallet Address</label>
                <div className="flex">
                  <Input
                    placeholder="e.g., 0x4543...4be8"
                    value={walletAddress}
                    onChange={(e) => {
                      setWalletAddress(e.target.value)
                      setVerificationResult(null)
                    }}
                    className="flex-1"
                  />
                  {account && (
                    <Button variant="outline" className="ml-2" onClick={() => setWalletAddress(account.address)}>
                      Use My Address
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                <div className="relative">
                  <Textarea
                    placeholder="Paste the document signature here"
                    value={signature}
                    onChange={(e) => {
                      setSignature(e.target.value)
                      setVerificationResult(null)
                    }}
                    className="min-h-[80px] pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-8 w-8 p-0"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText()
                        setSignature(text)
                        setVerificationResult(null)
                        toast.success("Signature pasted from clipboard")
                      } catch (err) {
                        toast.error("Failed to read from clipboard")
                        console.error("Clipboard error:", err)
                      }
                    }}
                    title="Paste from clipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-clipboard"
                    >
                      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    </svg>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  The cryptographic signature generated when the document was signed
                </p>
              </div>

              <Button
                onClick={handleVerify}
                disabled={!file || !walletAddress || !signature || isVerifying}
                className="w-full bg-sui-teal hover:bg-sui-teal/90"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verify Signature
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {verificationResult && (
          <Card className={verificationResult.status === "success" ? "border-green-200" : "border-red-200"}>
            <CardHeader className={verificationResult.status === "success" ? "bg-green-50" : "bg-red-50"}>
              <CardTitle className="flex items-center">
                {verificationResult.status === "success" ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-700">Signature Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">Verification Failed</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {verificationResult.status === "success" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium text-gray-500">Document</div>
                    <div className="col-span-2">{verificationResult.documentName}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium text-gray-500">Signed By</div>
                    <div className="col-span-2 font-mono">{verificationResult.signedBy}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium text-gray-500">Timestamp</div>
                    <div className="col-span-2">{verificationResult.signedAt}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium text-gray-500">Transaction ID</div>
                    <div className="col-span-2 font-mono text-xs truncate">{verificationResult.transactionId}</div>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      // className="text-sui-teal border-sui-teal hover:bg-sui-teal/10"
                      // disable style
                      className="text-sui-teal border-sui-teal hover:bg-sui-teal/10 hover:text-sui-teal disabled:text-gray-400 disabled:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                      disabled
                      onClick={() => {
                        if (verificationResult.transactionId) {
                          window.open(
                            `https://explorer.sui.io/txblock/${verificationResult.transactionId}?network=${NETWORK}`,
                            "_blank",
                          )
                        }
                      }}
                    >
                      View on Explorer
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-700">
                    The signature could not be verified. Please check the document, wallet address, and signature and
                    try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default VerifySignature
