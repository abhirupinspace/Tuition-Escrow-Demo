// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing purposes
 * @notice This contract mimics USDC functionality for testing the escrow system
 */
contract MockUSDC is ERC20, Ownable {
    /// @dev Number of decimals for the token (USDC uses 6 decimals)
    uint8 private constant DECIMALS = 6;
    
    /// @dev Maximum supply cap (100 million USDC for testing)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**DECIMALS;

    /// @dev Faucet amount per request (1000 USDC)
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**DECIMALS;

    /// @dev Cooldown period for faucet requests (24 hours)
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    /// @dev Mapping to track last faucet request time for each address
    mapping(address => uint256) public lastFaucetRequest;

    /// @dev Event emitted when tokens are minted via faucet
    event FaucetUsed(address indexed user, uint256 amount);

    /// @dev Custom errors
    error FaucetCooldownActive();
    error MaxSupplyExceeded();
    error InvalidAmount();

    /**
     * @dev Constructor initializes the mock USDC token
     * @param initialOwner Address of the initial owner
     */
    constructor(address initialOwner) ERC20("Mock USD Coin", "mUSDC") Ownable(initialOwner) {
        // Mint initial supply to owner for testing
        _mint(initialOwner, 10_000_000 * 10**DECIMALS); // 10M tokens
    }

    /**
     * @dev Returns the number of decimals used for token amounts
     * @return Number of decimals (6 for USDC compatibility)
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @dev Faucet function to get test tokens
     * @notice Users can request test tokens once every 24 hours
     */
    function faucet() external {
        if (block.timestamp < lastFaucetRequest[msg.sender] + FAUCET_COOLDOWN) {
            revert FaucetCooldownActive();
        }
        
        if (totalSupply() + FAUCET_AMOUNT > MAX_SUPPLY) {
            revert MaxSupplyExceeded();
        }

        lastFaucetRequest[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);

        emit FaucetUsed(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @dev Mint tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();
        
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        _burn(msg.sender, amount);
    }

    /**
     * @dev Check if address can use faucet
     * @param user Address to check
     * @return bool True if user can use faucet
     */
    function canUseFaucet(address user) external view returns (bool) {
        return block.timestamp >= lastFaucetRequest[user] + FAUCET_COOLDOWN;
    }

    /**
     * @dev Get time remaining until user can use faucet again
     * @param user Address to check
     * @return uint256 Seconds remaining (0 if can use now)
     */
    function faucetCooldownRemaining(address user) external view returns (uint256) {
        uint256 nextAvailable = lastFaucetRequest[user] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextAvailable) {
            return 0;
        }
        return nextAvailable - block.timestamp;
    }
}