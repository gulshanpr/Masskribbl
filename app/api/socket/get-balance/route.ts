import { NextResponse } from "next/server";
import { Account, JsonRpcProvider } from "@massalabs/massa-web3";
import "dotenv/config";

export async function GET() {
  try {
    const account = await Account.fromEnv();
    const provider = JsonRpcProvider.mainnet(account);

    const balance = await provider.balanceOf([account.address.toString()]);
    return NextResponse.json({ balance: balance[0] });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch balance" },
      { status: 500 }
    );
  }
}
