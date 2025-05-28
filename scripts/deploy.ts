import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying TuitionEscrow with existing mUSDC...");
  
  // Get deployer
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("👤 Deployer:", deployer.address);
  console.log("📡 Network:", network.name, `(${network.chainId})`);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Your existing mUSDC address
  const MUSDC_ADDRESS = "0x466e34e422e7775e7EbB606c9F4cE870e9A2817e";
  
  console.log("🪙 Using mUSDC at:", MUSDC_ADDRESS);
  
  // Deploy TuitionEscrow
  console.log("\n🏦 Deploying TuitionEscrow...");
  const TuitionEscrowFactory = await ethers.getContractFactory("TuitionEscrow");
  const tuitionEscrow = await TuitionEscrowFactory.deploy(MUSDC_ADDRESS, deployer.address);
  
  await tuitionEscrow.waitForDeployment();
  const tuitionEscrowAddress = await tuitionEscrow.getAddress();
  
  console.log("✅ TuitionEscrow deployed to:", tuitionEscrowAddress);
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await tuitionEscrow.owner();
  const stablecoin = await tuitionEscrow.stablecoin();
  
  console.log("   Owner:", owner);
  console.log("   Stablecoin:", stablecoin);
  
  console.log("\n🎉 Deployment completed!");
  console.log("\n📋 Contract Addresses:");
  console.log("   TuitionEscrow:", tuitionEscrowAddress);
  console.log("   mUSDC:", MUSDC_ADDRESS);
  
  console.log("\n🔗 Verify on Etherscan:");
  console.log(`npx hardhat verify --network ${network.name} ${tuitionEscrowAddress} ${MUSDC_ADDRESS} ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });