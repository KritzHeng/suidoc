import { getFullnodeUrl } from "@mysten/sui/client";
import { TESTNET_PACKAGE_ID, TESTNET_GQL_CLIENT } from "./constants";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        packageId: TESTNET_PACKAGE_ID,
        gqlClient: TESTNET_GQL_CLIENT,
      },
    },
  });

export { networkConfig, useNetworkVariable, useNetworkVariables };
