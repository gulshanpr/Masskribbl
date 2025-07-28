"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { getWallets } from "@massalabs/wallet-provider";
import { Account, JsonRpcProvider } from "@massalabs/massa-web3";
import "dotenv/config";

const WalletConnect = async () => {
  const handleWalletConnect = async () => {
    try {
      const wallets = await getWallets();

      if (wallets.length === 0) {
        console.log("No wallets found");
        return;
      }

      // Use the first available wallet
      const wallet = wallets[0];
      // Connect to the wallet
      const connected = await wallet.connect();
      if (!connected) {
        console.log("Failed to connect to wallet");
        return;
      }

      // Get accounts
      const accounts = await wallet.accounts();
      console.log("Accounts:", accounts);

      // Listen for account changes
      wallet.listenAccountChanges((address) => {
        console.log("Account changed:", address);
      });

      // Get network info
      const networkInfo = await wallet.networkInfos();
      console.log("Network info:", networkInfo);
      console.log("Wallet connected successfully!");
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  };

  const handlePublicFunction = async () => {
    try {
      const res = await fetch("/api/get-balance");
      const data = await res.json();
      console.log("Balance:", data.balance);
    } catch (error) {
      console.error("Failed to call public function:", error);
    }
  };

  const handleWalletDisconnect = async () => {
    const wallets = await getWallets();

    if (wallets.length === 0) {
      console.log("No wallets found");
      return;
    }

    // Use the first available wallet
    const wallet = wallets[0];

    try {
      if (await wallet.connected()) {
        await wallet.disconnect();
        console.log("Wallet disconnected successfully!");
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const handleGenerateKeys = async () => {
    try {
      const account = await Account.generate();
      console.log("address:", account.address.toString());
      console.log("public key:", account.publicKey.toString());
      console.log("private key:", account.privateKey.toString());
    } catch (error) {
      console.error("Failed to generate keys:", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Button onClick={handleWalletConnect}>wallet connect</Button>
      <Button onClick={handleWalletDisconnect}>wallet disconnect</Button>

      <Button onClick={handleGenerateKeys}>generate keys</Button>
      <Button onClick={handlePublicFunction}>check my balance</Button>
    </div>
  );
};

export default WalletConnect;
