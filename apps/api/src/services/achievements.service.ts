import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { z } from "zod";

import { env } from "../config/env";
import { firestore } from "../config/firebase-admin";

const achievementsRef = firestore.collection("achievements");

const mintSchema = z.object({
  studentId: z.string().min(3),
  eventId: z.string().min(3),
  title: z.string().min(3),
  metadataUri: z.string().url()
});

const ABI = [
  "function mintAchievement(address to, string memory tokenURI, string memory eventId, string memory category) public returns (uint256)",
  "function tokenCounter() public view returns (uint256)"
];

type AchievementContract = Contract & {
  mintAchievement: (
    to: string,
    tokenURI: string,
    eventId: string,
    category: string
  ) => Promise<{ hash: string; wait: () => Promise<{ hash: string } | null> }>;
};

export async function listAchievements(studentId: string): Promise<Record<string, unknown>[]> {
  const snapshot = await achievementsRef.where("studentId", "==", studentId).limit(100).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function mintAchievement(payload: unknown): Promise<Record<string, unknown>> {
  const parsed = mintSchema.parse(payload);

  if (!env.PRIVATE_KEY || !env.ACHIEVEMENT_CONTRACT_ADDRESS) {
    const fallbackRecord = {
      ...parsed,
      verified: false,
      txHash: null,
      tokenId: null,
      mintedAt: new Date().toISOString(),
      note: "Blockchain signer not configured"
    };

    const ref = await achievementsRef.add(fallbackRecord);
    return { id: ref.id, ...fallbackRecord };
  }

  const provider = new JsonRpcProvider(env.POLYGON_RPC_URL);
  const wallet = new Wallet(env.PRIVATE_KEY, provider);
  const contract = new Contract(env.ACHIEVEMENT_CONTRACT_ADDRESS, ABI, wallet) as AchievementContract;

  const tx = await contract.mintAchievement(wallet.address, parsed.metadataUri, parsed.eventId, parsed.title);
  const receipt = await tx.wait();

  const onChainRecord = {
    ...parsed,
    verified: true,
    txHash: receipt?.hash ?? tx.hash,
    tokenId: null,
    mintedAt: new Date().toISOString()
  };

  const ref = await achievementsRef.add(onChainRecord);
  return { id: ref.id, ...onChainRecord };
}
