import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TuitionEscrowModule = buildModule("TuitionEscrowModule", (m) => {
  // Parameters with default values for flexibility
  const owner = m.getParameter("owner", "0x0000000000000000000000000000000000000000");
  const stablecoinAddress = m.getParameter("stablecoinAddress", "0x0000000000000000000000000000000000000000");

  // Deploy MockUSDC first (if not using real USDC)
  const mockUSDC = m.contract("MockUSDC", [owner], {
    id: "MockUSDC",
  });

  // Deploy TuitionEscrow contract
  const tuitionEscrow = m.contract("TuitionEscrow", [
    // Use provided stablecoin address if available, otherwise use MockUSDC
    stablecoinAddress.toString() === "0x0000000000000000000000000000000000000000" 
      ? mockUSDC 
      : stablecoinAddress,
    owner
  ], {
    id: "TuitionEscrow",
  });

  return { 
    mockUSDC, 
    tuitionEscrow
  };
});

export default TuitionEscrowModule;