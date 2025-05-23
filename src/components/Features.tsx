import {
  FileText,
  ShieldCheck,
  Zap,
  Lock,
  Link as LinkIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Features = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Secure Document Signing{" "}
                <span className="text-sui-teal">Powered by Blockchain</span>
              </h1>
              <p className="text-lg text-gray-600">
                SuiDoc Vault lets you create, manage, and sign documents with
                cryptographic proof on the Sui blockchain, providing immutable
                records and enhanced security.
              </p>
            </div>
            <div className="">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  {/* <FileText className="h-20 w-20 text-sui-teal opacity-50" /> */}
                  <img
                    src="/docWithSign.png"
                    alt="Document preview"
                    // className="h-20 w-20 object-contain opacity-80"
                  />
                </div>
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div>
                    <h3 className="font-medium">Sample Contract</h3>
                    <p className="text-sm text-gray-500">Ready for signature</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 rounded-full bg-sui-teal/20 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-sui-teal" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How SuiDoc Works
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our blockchain-powered document signing platform provides
              security, transparency, and immutability for all your important
              documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-sui-teal/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-sui-teal" />
                </div>
                <CardTitle>Upload & Prepare</CardTitle>
                <CardDescription>
                  Upload your documents securely to our platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Upload any PDF or document file. Specify signature fields by
                  adding placeholders that determine who signs where.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-sui-teal/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-sui-teal" />
                </div>
                <CardTitle>Sign with Wallet</CardTitle>
                <CardDescription>
                  Sign documents using your Sui wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Use your blockchain wallet to cryptographically sign
                  documents, creating a tamper-proof record of your signature on
                  the Sui blockchain.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-sui-teal/10 flex items-center justify-center mb-4">
                  <LinkIcon className="h-6 w-6 text-sui-teal" />
                </div>
                <CardTitle>Blockchain Verification</CardTitle>
                <CardDescription>
                  All signatures are verified on-chain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Each signature is recorded on the Sui blockchain, creating a
                  permanent, verifiable record that can be checked at any time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              SuiDoc Vault provides everything you need for secure document
              management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-sui-teal/10 flex items-center justify-center mr-4">
                  <Zap className="h-5 w-5 text-sui-teal" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Fast & Secure Signing
                  </h3>
                  <p className="text-gray-600">
                    Sign documents in seconds with the security of blockchain
                    technology backing every signature.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-sui-teal/10 flex items-center justify-center mr-4">
                  <Lock className="h-5 w-5 text-sui-teal" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    End-to-End Encryption
                  </h3>
                  <p className="text-gray-600">
                    All documents are encrypted and securely stored, accessible
                    only to authorized signatories.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-sui-teal/10 flex items-center justify-center mr-4">
                  <FileText className="h-5 w-5 text-sui-teal" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Document Management
                  </h3>
                  <p className="text-gray-600">
                    Easily organize, track, and manage all your documents in one
                    secure location.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-sui-teal/10 flex items-center justify-center mr-4">
                  <ShieldCheck className="h-5 w-5 text-sui-teal" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Tamper-Proof Records
                  </h3>
                  <p className="text-gray-600">
                    Blockchain verification ensures that signed documents cannot
                    be altered after signing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get answers to common questions about SuiDoc Vault
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  What is blockchain document signing?
                </AccordionTrigger>
                <AccordionContent>
                  Blockchain document signing uses cryptographic technology to
                  create tamper-proof, verifiable signatures. Unlike traditional
                  e-signatures, blockchain signatures are recorded on a
                  distributed ledger, making them immutable and providing a
                  permanent record of who signed what and when.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Do I need a Sui wallet to use SuiDoc?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, you'll need a Sui-compatible wallet to sign documents on
                  our platform. This ensures that your signatures are securely
                  linked to your blockchain identity. If you don't have a wallet
                  yet, we can guide you through setting one up.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  Are my documents stored on the blockchain?
                </AccordionTrigger>
                <AccordionContent>
                  No, only the signature proof and document hash are stored on
                  the blockchain. The actual documents are stored securely in
                  encrypted form on our servers, ensuring both privacy and
                  verifiability.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Is SuiDoc legally binding?</AccordionTrigger>
                <AccordionContent>
                  SuiDoc signatures include all the elements needed for legally
                  binding electronic signatures in most jurisdictions, including
                  proof of identity, intent to sign, and record retention.
                  However, legal requirements vary by country and document type,
                  so please consult legal advice for specific use cases.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sui-navy text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to get started with secure document signing?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of users who trust SuiDoc Vault for their important
            documents
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">10k+</p>
              <p className="text-sm opacity-75">Documents Signed</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5k+</p>
              <p className="text-sm opacity-75">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm opacity-75">Secure</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm opacity-75">Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
