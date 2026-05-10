import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account available");
  }

  console.log(`Deploying with: ${deployer.address}`);

  const factory = await ethers.getContractFactory("CampusAchievement");
  const contract = await factory.deploy(deployer.address);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`CampusAchievement deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
