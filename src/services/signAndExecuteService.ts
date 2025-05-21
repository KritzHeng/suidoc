// import { useSuiClient } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import {
  SUIDOC_MODULE,
  SUIDOC_PACKAGE_ID,
  PACKAGE_ID,
  WALRUS_PACKAGE_ID,
} from "@/config/constants";
import { useState } from "react";

export async function createAllowlist(name: string, wallet: any): Promise<any> {
  const rpcUrl = getFullnodeUrl("testnet");
  const client = new SuiClient({ url: rpcUrl });

  if (!name) throw new Error("Name is required");
  const tx = new Transaction();

  tx.moveCall({
    target: `${WALRUS_PACKAGE_ID}::allowlist::create_allowlist_entry`,
    arguments: [tx.pure.string(name)],
  });

  tx.setGasBudget(10000000);

  const result = await wallet.signAndExecuteTransaction({
    transaction: tx,
    options: {
      showRawEffects: true,
      showEffects: true,
    },
  });

  const waitResult = await client.waitForTransaction({
    digest: result.digest,
    options: {
      showEvents: true,
      showObjectChanges: true,
    },
  });

  console.log("Wait result:", waitResult);

  // Find objects using objectChanges instead of effects
  const allowlistObj = waitResult.objectChanges?.find(
    (change) =>
      change.type === "created" &&
      change.owner &&
      typeof change.owner === "object" &&
      "Shared" in change.owner
  );

  const capObj = waitResult.objectChanges?.find(
    (change) =>
      change.type === "created" &&
      change.owner &&
      typeof change.owner === "object" &&
      "AddressOwner" in change.owner
  );

  console.log("Allowlist object:", allowlistObj);
  console.log("Cap object:", capObj);

  if (!allowlistObj) throw new Error("Failed to find allowlist object");
  if (!capObj) throw new Error("Failed to find Cap ID object");

  // Access objectId directly from the objectChange
  const allowlistObjectId = allowlistObj.objectId;
  const capId = capObj.objectId;
  console.log("--allowlistObjectId:", allowlistObjectId);
  console.log("--capId:", capId);

  if (!capId) throw new Error("Failed to find Cap ID");

  //add user to allowlist

  // fix allowlistObjectId
  return { allowlistObjectId, capId };
}

export async function addToAllowlist(
  allowlistObjectId: string,
  capId: string,
  wallet: any
): Promise<any> {
  const rpcUrl = getFullnodeUrl("testnet");
  const client = new SuiClient({ url: rpcUrl });

  const txb = new Transaction();
  txb.moveCall({
    arguments: [
      txb.object(allowlistObjectId),
      txb.object(capId),
      txb.pure.address(wallet.address.trim()),
    ],
    target: `${WALRUS_PACKAGE_ID}::allowlist::add`,
  });
  txb.setGasBudget(10000000);

  const resultAdd = await wallet.signAndExecuteTransaction({
    transaction: txb,
    options: {
      showRawEffects: true,
      showEffects: true,
    },
  });

  const waitResultAdd = await client.waitForTransaction({
    digest: resultAdd.digest,
    options: {
      showEvents: true,
      showObjectChanges: true,
    },
  });
  console.log("Wait result add:", waitResultAdd);
}

export async function isInAllowlist(
  allowlistObjectId: string,
  wallet: any
): Promise<boolean> {
  const rpcUrl = getFullnodeUrl("testnet");
  const client = new SuiClient({ url: rpcUrl });

  const allowlist = await client.getObject({
    id: allowlistObjectId!,
    options: { showContent: true },
  });

  const fields = (allowlist.data?.content as { fields: any })?.fields || {};
  const list: string[] = Array.isArray(fields.list) ? fields.list : [];
  console.log("List:", list);
  console.log("Wallet address:", wallet.address);

  // const allowlistforcap = await client.getObject({
  //   id: allowlistObjectId!,
  //   options: { showContent: true },
  // });

  // const capId = fields.data
  //   .map((obj) => {
  //     const fields = (obj!.data!.content as { fields: any }).fields;
  //     return {
  //       id: fields?.id.id,
  //       allowlist_id: fields?.allowlist_id,
  //     };
  //   })
  //   .filter((item) => item.allowlist_id === allowlistObjectId)
  //   .map((item) => item.id) as string[];
  // console.log("Cap ID:", capId);

  if (wallet.address in list) {
    console.log("User is in allowlist");
    return true;
  } else {
    console.log("User is not in allowlist");
    return false;
  }
}
