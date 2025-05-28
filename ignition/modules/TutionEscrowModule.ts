import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TuitionEscrowSimpleModule = buildModule("TuitionEscrowSimple", (m) => {
  // Your existing mUSDC contract address
  const mUSDCAddress = "0x466e34e422e7775e7EbB606c9F4cE870e9A2817e";
  
  // Get the deployer account
  const deployer = m.getAccount(0);

  // Deploy only TuitionEscrow contract using existing mUSDC
  const tuitionEscrow = m.contract("TuitionEscrow", [mUSDCAddress, deployer]);

  return { tuitionEscrow };
});

export default TuitionEscrowSimpleModule;