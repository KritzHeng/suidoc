import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair, Ed25519PublicKey } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import keyPairJson from '../../../keypair.json';
import { fromHEX, toB64, fromB64 } from '@mysten/sui/utils';



async function verifyMsg() {
  try {
    const msg = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
    const msgBytes = new TextEncoder().encode(msg);

    const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
    const keypair = Ed25519Keypair.fromSecretKey(secretKey);
    console.log("publick key: ", keypair.getPublicKey());
    console.log("address:", keypair.getPublicKey().toSuiAddress());
    const result = await keypair.sign(msgBytes)
    console.log("signMessage result", result);

    // not work for now
    const suiAddress = "d77a6cd55073e98d4029b1b0b8bd8d88f45f343dad2732fc9a7965094e635c55";
    // it's should convert suiAddress to public key as buffer
    const addressBytes = fromHEX(suiAddress);
    console.log("addressBytes", toB64(addressBytes));
    
    // ED25519 public key as buffer
    // length: 32
    // [
    //  80, 210,  0,  0,  0,  0,  0,  0,
    // ]
    // const addressBytes = new Uint8Array(keyPairJson.buffer);


    const pubKey = new Ed25519PublicKey(fromB64("IyVVJiRGYzWVRLNG5SeDVzQzlRPT0="));
    console.log("pubKey", pubKey.toSuiAddress());
    console.log("pubKey", pubKey);
    console.log("addressBytes", addressBytes);


    const isValid = await pubKey.verify(msgBytes, result);
    // const isValid = await keypair.getPublicKey().verify(msgBytes, result);
    console.log("verify signedMessage with pubKey", isValid);
  } catch (e) {
    console.error("signMessage failed", e);
    alert("signMessage failed (see response in the console)");
  }
}
// Example Usage
(async () => {
  try {
    await verifyMsg();
  } catch (error) {
    console.error("Error:", error);
  }
})();