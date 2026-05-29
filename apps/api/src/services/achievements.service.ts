import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { z } from "zod";
import mongoose from "mongoose";

import { env } from "../config/env";
import AchievementModel from "../models/achievement.model";

const mintSchema = z.object({
  studentId: z.string().min(3),
  eventId: z.string().min(3),
  title: z.string().min(3),
  metadataUri: z.string().url(),
  id: z.string().optional()
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
  const achievements = await AchievementModel.find({ studentId }).limit(100);
  return achievements.map((doc) => doc.toJSON()) as any;
}

export async function mintAchievement(payload: unknown): Promise<Record<string, unknown>> {
  const parsed = mintSchema.parse(payload);
  
  const achievementId = parsed.id || new mongoose.Types.ObjectId().toString();

  if (!env.PRIVATE_KEY || !env.ACHIEVEMENT_CONTRACT_ADDRESS) {
    const fallbackRecord = {
      _id: achievementId,
      ...parsed,
      verified: false,
      txHash: undefined,
      tokenId: undefined,
      mintedAt: new Date(),
      note: "Blockchain signer not configured"
    };

    const created = await AchievementModel.create(fallbackRecord);
    return created.toJSON() as any;
  }

  const provider = new JsonRpcProvider(env.POLYGON_RPC_URL);
  const wallet = new Wallet(env.PRIVATE_KEY, provider);
  const contract = new Contract(env.ACHIEVEMENT_CONTRACT_ADDRESS, ABI, wallet) as AchievementContract;

  const tx = await contract.mintAchievement(wallet.address, parsed.metadataUri, parsed.eventId, parsed.title);
  const receipt = await tx.wait();

  const onChainRecord = {
    _id: achievementId,
    ...parsed,
    verified: true,
    txHash: receipt?.hash ?? tx.hash,
    tokenId: undefined,
    mintedAt: new Date()
  };

  const created = await AchievementModel.create(onChainRecord);
  return created.toJSON() as any;
}
