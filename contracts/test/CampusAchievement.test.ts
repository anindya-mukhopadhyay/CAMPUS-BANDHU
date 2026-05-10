import { expect } from "chai";
import { ethers } from "hardhat";

describe("CampusAchievement", () => {
  it("mints and verifies an achievement", async () => {
    const [owner, student] = await ethers.getSigners();
    if (!owner || !student) {
      throw new Error("Required signers not available");
    }

    const factory = await ethers.getContractFactory("CampusAchievement");
    const contract = await factory.deploy(owner.address);
    await contract.waitForDeployment();

    await contract.mintAchievement!(student.address, "ipfs://test", "event-101", "hackathon");

    const tokenIds = await contract.tokensOf!(student.address);
    expect(tokenIds.length).to.equal(1);
    expect(tokenIds[0]).to.equal(0n);
  });
});
