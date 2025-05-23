# SuiDoc

## Project info

Project Description
SuiDoc is a secure, blockchain-based electronic document signing platform that simplifies digital workflows with multi-party signing, document storage, and customizable templates. The platform leverages the Walrus decentralized storage system on the Sui blockchain for immutable, tamper-proof, and scalable document storage. Advanced encryption protects document privacy, ensuring only authorized users can access sensitive data. Users can store documents securely, sign them collaboratively with multi-signature support, and utilize reusable templates to streamline recurring processes. SuiDoc integrates AI-powered live chat support for real-time assistance, delivering a seamless, secure, and efficient electronic document management experience by combining blockchain immutability with privacy-focused encryption.

**URL**: https://sui-sign-vault.vercel.app

## 🚀 Features

- **Seamless Wallet Creation**: Users connect using their Sui wallet to interact with the SuiDoc platform effortlessly.
- **On-Chain Document Registration**: Uploaded documents are registered on-chain through Sui smart contracts, linking ownership to the user's wallet.
- **Secure Decentralized Storage**: All documents are encrypted and securely stored using Walrus, a decentralized storage system designed for privacy and resilience.
- **Encrypted Document Retrieval**: Users can retrieve and decrypt documents locally using their private wallet keys, ensuring full control over their data.
- **Client-Side Document Signing**: Documents are signed locally within the user's wallet, enhancing security by keeping private keys off-chain.
- **On-Chain Signature Verification**: The platform verifies signatures on-chain to confirm document authenticity and ownership, enabling trustless verification. 

## What technologies are used for this project?

This project is built with:

### ⚙️ Core Stack
- [Vite](https://vitejs.dev/) – Fast build tool and dev server
- [React](https://react.dev/) – Declarative UI library
- [TypeScript](https://www.typescriptlang.org/) – Strongly-typed JavaScript
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [@mysten/sui](https://docs.sui.io/) – Sui blockchain SDK
- [@mysten/dapp-kit](https://docs.sui.io/devnet/build/dapp-kit) – Sui dApp development utilities
- [@mysten/seal](https://github.com/MystenLabs/seal) – Sealed-box encryption for the Sui ecosystem. Encrypts data client-side for a recipient's public key using Libsodium-based cryptography. Works with [Walrus](https://github.com/MystenLabs/walrus), a secure multi-party computation (MPC) backend that enables privacy-preserving decryption without exposing private keys.
- [@suiet/wallet-kit](https://www.npmjs.com/package/@suiet/wallet-kit) – Sui wallet integration


# Diagrams

Upload, Sign, Verified Workflow

![Account Creation](/public/sequence-diagram.png)

