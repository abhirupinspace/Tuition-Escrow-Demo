import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ethers";
import * as fs from "fs";
import * as path from "path";

interface DeploymentConfig {
  deployMockUSDC: boolean;
  stablecoinAddress?: string;
  ownerAddress?: string;
}

interface DeploymentResult {
  mockUSDC?: string;
  tuitionEscrow: string;
  stablecoinAddress: string;
  network: string;
  deployer: string;
  blockNumber: number;
  timestamp: number;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const provider = ethers.getDefaultProvider();
  const network = await provider.getNetwork();
  
  console.log("🚀 Starting deployment process...");
  console.log("📡 Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("─".repeat(60));

  // Configuration based on network
  const config: DeploymentConfig = getNetworkConfig(network.chainId);
  
  let mockUSDCAddress: string | undefined;
  let stablecoinAddress: string;

  // Deploy MockUSDC if needed
  if (config.deployMockUSDC) {
    console.log("🪙 Deploying MockUSDC...");
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDCFactory.deploy(config.ownerAddress || deployer.address);
    await mockUSDC.waitForDeployment();
    
    mockUSDCAddress = await mockUSDC.getAddress();
    stablecoinAddress = mockUSDCAddress;
    
    console.log("✅ MockUSDC deployed to:", mockUSDCAddress);
    
    // Verify deployment
    const name = await mockUSDC.name();
    const symbol = await mockUSDC.symbol();
    const decimals = await mockUSDC.decimals();
    console.log(`   📋 Token: ${name} (${symbol}) - ${decimals} decimals`);
  } else {
    stablecoinAddress = config.stablecoinAddress!;
    console.log("🪙 Using existing stablecoin at:", stablecoinAddress);
  }

  console.log("─".repeat(60));

  // Deploy TuitionEscrow
  console.log("🏦 Deploying TuitionEscrow...");
  const TuitionEscrowFactory = await ethers.getContractFactory("TuitionEscrow");
  const tuitionEscrow = await TuitionEscrowFactory.deploy(
    stablecoinAddress,
    config.ownerAddress || deployer.address
  );
  await tuitionEscrow.waitForDeployment();

  const tuitionEscrowAddress = await tuitionEscrow.getAddress();
  console.log("✅ TuitionEscrow deployed to:", tuitionEscrowAddress);

  // Verify deployment
  const owner = await tuitionEscrow.owner();
  const stablecoin = await tuitionEscrow.stablecoin();
  console.log(`   👤 Owner: ${owner}`);
  console.log(`   🪙 Stablecoin: ${stablecoin}`);

  console.log("─".repeat(60));

  // Get deployment info
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber);
  
  const deploymentResult: DeploymentResult = {
    tuitionEscrow: tuitionEscrowAddress,
    stablecoinAddress,
    network: network.name,
    deployer: deployer.address,
    blockNumber,
    timestamp: block?.timestamp || 0,
  };

  if (mockUSDCAddress) {
    deploymentResult.mockUSDC = mockUSDCAddress;
  }

  // Save deployment results
  await saveDeploymentResult(deploymentResult);

  // Print summary
  console.log("🎉 Deployment completed successfully!");
  console.log("📊 Summary:");
  if (mockUSDCAddress) {
    console.log(`   MockUSDC: ${mockUSDCAddress}`);
  }
  console.log(`   TuitionEscrow: ${tuitionEscrowAddress}`);
  console.log(`   Stablecoin: ${stablecoinAddress}`);
  console.log(`   Block: ${blockNumber}`);
  console.log("─".repeat(60));

  // Print next steps
  console.log("🔍 Next steps:");
  console.log("1. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network ${network.name} ${tuitionEscrowAddress} ${stablecoinAddress} ${config.ownerAddress || deployer.address}`);
  if (mockUSDCAddress) {
    console.log(`   npx hardhat verify --network ${network.name} ${mockUSDCAddress} ${config.ownerAddress || deployer.address}`);
  }
  console.log("2. Update frontend configuration with contract addresses");
  console.log("3. Test the deployment with some transactions");

  return deploymentResult;
}

function getNetworkConfig(chainId: bigint): DeploymentConfig {
  switch (chainId) {
    case 1n: // Mainnet
      return {
        deployMockUSDC: false,
        stablecoinAddress: "0xA0b86a33E6441efED9dfCE23ac8A70d84a4ff57", // Real USDC on mainnet
      };
    
    case 11155111n: // Sepolia
      return {
        deployMockUSDC: true, // Deploy mock for testing
      };
    
    case 31337n: // Hardhat local
      return {
        deployMockUSDC: true,
      };
    
    default:
      console.log("⚠️  Unknown network, using default config (deploying MockUSDC)");
      return {
        deployMockUSDC: true,
      };
  }
}

async function saveDeploymentResult(result: DeploymentResult) {
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save network-specific deployment
  const networkFile = path.join(deploymentsDir, `${result.network}.json`);
  fs.writeFileSync(networkFile, JSON.stringify(result, null, 2));
  
  // Save latest deployment
  const latestFile = path.join(deploymentsDir, "latest.json");
  fs.writeFileSync(latestFile, JSON.stringify(result, null, 2));
  
  console.log("💾 Deployment info saved to:", networkFile);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });