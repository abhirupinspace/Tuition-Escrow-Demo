# TuitionEscrow dApp

A secure cross-border payment system built on Ethereum that enables stablecoin-based tuition fee transfers between students and universities through an escrow mechanism with administrative oversight.

## Overview

This decentralized application facilitates international education payments by holding student funds in escrow until authorized release by administrators. The system eliminates traditional banking intermediaries while providing security guarantees through smart contract automation and admin controls.

### Key Features

- **Secure Escrow System**: Funds are held safely in smart contracts until release authorization
- **Administrative Controls**: Designated administrators can release payments to universities or refund students
- **Stablecoin Integration**: Uses USDC or compatible ERC20 tokens to minimize volatility
- **Multi-Payment Support**: Handles multiple concurrent payments with unique tracking
- **Complete Audit Trail**: All transactions are recorded on-chain with detailed event logging
- **Emergency Controls**: Pause functionality and emergency withdrawal capabilities

## Architecture

### Smart Contracts

**TuitionEscrow.sol** - Main escrow contract implementing:
- Payment initialization and tracking
- Secure fund deposit mechanism
- Administrative release and refund functions
- Emergency pause and recovery functions
- Comprehensive event emission for transparency

**MockUSDC.sol** - ERC20 test token for development and testing purposes

### Technology Stack

#### Backend
- **Solidity** ^0.8.19 - Smart contract development
- **Hardhat** - Development framework and testing environment
- **OpenZeppelin** - Security-audited contract libraries
- **TypeScript** - Type-safe development
- **ethers.js** v6 - Ethereum interaction library

#### Frontend
- **Next.js** 15+ - React framework for production applications
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling framework
- **wagmi** + **viem** - Type-safe Ethereum integration
- **WalletConnect** - Multi-wallet connection support

## Contract Deployment

### Sepolia Testnet

- **TuitionEscrow**: `0x[CONTRACT_ADDRESS]` (deployed)
- **Test Token (mUSDC)**: `0x466e34e422e7775e7EbB606c9F4cE870e9A2817e`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Block Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/CONTRACT_ADDRESS)

## Installation and Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git
- MetaMask or compatible Web3 wallet

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tuition-escrow-dapp.git
   cd tuition-escrow-dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   PRIVATE_KEY=your_wallet_private_key
   SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   ETHERSCAN_API_KEY=your_etherscan_api_key
   MUSDC_ADDRESS=0x466e34e422e7775e7EbB606c9F4cE870e9A2817e
   ```

4. **Compile smart contracts**
   ```bash
   npm run compile
   ```

5. **Run test suite**
   ```bash
   npm test
   ```

## Smart Contract API

### Core Functions

#### `initialize(address payer, address university, uint256 amount, string calldata invoiceRef) → uint256`
Creates a new payment escrow with specified parameters.

**Parameters:**
- `payer`: Address of the student making the payment
- `university`: Address of the receiving institution
- `amount`: Payment amount in stablecoin base units
- `invoiceRef`: Unique reference identifier for the payment

**Returns:** Unique payment ID for tracking

**Events:** `PaymentInitialized(uint256 indexed paymentId, address indexed payer, address indexed university, uint256 amount, string invoiceRef)`

#### `deposit(uint256 paymentId)`
Transfers approved stablecoin amount from payer to escrow contract.

**Parameters:**
- `paymentId`: Unique identifier of the payment to fund

**Requirements:**
- Caller must be the designated payer
- Payment must be in INITIALIZED state
- Sufficient token balance and allowance required

**Events:** `Deposited(uint256 indexed paymentId, address indexed payer, uint256 amount)`

#### `release(uint256 paymentId)` [Owner Only]
Releases escrowed funds to the designated university.

**Parameters:**
- `paymentId`: Unique identifier of the payment to release

**Requirements:**
- Only contract owner can execute
- Payment must be in DEPOSITED state

**Events:** `Released(uint256 indexed paymentId, address indexed university, uint256 amount)`

#### `refund(uint256 paymentId)` [Owner Only]
Returns escrowed funds to the original payer.

**Parameters:**
- `paymentId`: Unique identifier of the payment to refund

**Requirements:**
- Only contract owner can execute
- Payment must be in DEPOSITED state

**Events:** `Refunded(uint256 indexed paymentId, address indexed payer, uint256 amount)`

### View Functions

#### `getPayment(uint256 paymentId) → Payment`
Retrieves complete payment information including status and timestamps.

#### `getPayerPayments(address payer) → uint256[]`
Returns array of payment IDs associated with a specific payer address.

#### `getUniversityPayments(address university) → uint256[]`
Returns array of payment IDs associated with a specific university address.

#### `getCurrentPaymentId() → uint256`
Returns the next available payment ID (total count of payments created).

#### `getContractBalance() → uint256`
Returns current stablecoin balance held in escrow.

### Payment States

- **INITIALIZED** (0): Payment created but funds not yet deposited
- **DEPOSITED** (1): Funds held in escrow awaiting administrator action
- **RELEASED** (2): Funds released to university (final state)
- **REFUNDED** (3): Funds returned to payer (final state)

## Testing

### Comprehensive Test Suite

The project includes extensive testing covering all contract functionality:

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:escrow        # Core escrow functionality
npm run test:integration   # End-to-end workflows

# Generate coverage report
npm run test:coverage

# Run tests with gas reporting
REPORT_GAS=true npm test
```

### Test Categories

- **Contract Deployment**: Validates proper initialization
- **Payment Management**: Tests creation and tracking of payments
- **Deposit Functionality**: Verifies secure fund transfer mechanisms
- **Administrative Controls**: Tests owner-only release and refund functions
- **Security Validations**: Ensures proper access controls and input validation
- **Emergency Functions**: Tests pause and emergency withdrawal capabilities
- **Multi-Payment Scenarios**: Validates concurrent payment handling

## Deployment

### Deploy to Sepolia Testnet

1. **Ensure testnet ETH balance**
   - Obtain Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

2. **Deploy using Hardhat Ignition**
   ```bash
   npm run ignition:sepolia
   ```

3. **Alternative deployment method**
   ```bash
   npm run deploy:simple
   ```

4. **Verify deployment**
   ```bash
   npm run verify:deployment -- --network sepolia
   ```

5. **Verify on Etherscan**
   ```bash
   npx hardhat verify --network sepolia TUITION_ESCROW_ADDRESS 0x466e34e422e7775e7EbB606c9F4cE870e9A2817e YOUR_WALLET_ADDRESS
   ```

### Deploy to Other Networks

The contract system supports deployment to various networks:

```bash
# Local development
npm run node                    # Start local blockchain
npm run ignition:localhost      # Deploy to local network

# Mainnet (production)
npm run ignition:mainnet        # Uses real USDC
```

## Usage Examples

### Initialize Payment

```typescript
const paymentId = await tuitionEscrow.initialize(
  "0x1234...5678",              // Student address
  "0xabcd...ef00",              // University address
  ethers.parseUnits("5000", 6), // 5000 USDC
  "INV-2024-001"                // Invoice reference
);
```

### Student Deposit

```typescript
// Approve token spending
await usdcToken.approve(escrowAddress, amount);

// Deposit funds to escrow
await tuitionEscrow.connect(student).deposit(paymentId);
```

### Administrative Actions

```typescript
// Release payment to university
await tuitionEscrow.connect(admin).release(paymentId);

// Or refund to student
await tuitionEscrow.connect(admin).refund(paymentId);
```

## Security Considerations

### Implemented Security Measures

- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner-based permissions for critical functions
- **Input Validation**: Comprehensive parameter checking and custom errors
- **Safe Token Transfers**: Utilizes SafeERC20 for secure token operations
- **State Machine Logic**: Enforces proper payment state transitions
- **Emergency Controls**: Pause functionality and emergency withdrawal capabilities

### Security Assumptions

- **Admin Key Management**: Contract owner holds significant control and should use multi-signature wallets in production
- **Token Compatibility**: Assumes standard ERC20 token behavior
- **Network Security**: Relies on Ethereum network consensus for transaction finality
- **External Dependencies**: Trusts OpenZeppelin library implementations

### Recommended Security Practices

- Deploy through multi-signature wallet for production use
- Conduct professional security audit before mainnet deployment
- Implement time-locks for critical administrative functions
- Monitor contract events for suspicious activity
- Maintain emergency response procedures

## Gas Optimization

The contract implements several gas optimization techniques:

- **Custom Errors**: Reduces gas costs compared to string revert messages
- **Efficient Storage**: Optimized struct packing and storage patterns
- **Minimal External Calls**: Reduces gas consumption through batched operations
- **Event-Driven Architecture**: Provides detailed logging without excessive storage costs

## Frontend Integration

### Contract ABIs and Type Definitions

After compilation, contract ABIs and TypeScript definitions are available in:
- `artifacts/contracts/` - Compiled contract artifacts
- `typechain-types/` - Generated TypeScript type definitions

### Key Integration Points

```typescript
import { TuitionEscrow__factory } from './typechain-types';

// Connect to deployed contract
const contract = TuitionEscrow__factory.connect(contractAddress, signer);

// Initialize payment
const tx = await contract.initialize(payer, university, amount, invoiceRef);
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/enhancement-name`
3. Make changes with appropriate tests
4. Ensure all tests pass: `npm test`
5. Commit changes: `git commit -m 'Add enhancement'`
6. Push to branch: `git push origin feature/enhancement-name`
7. Submit pull request

### Code Quality Standards

- Comprehensive test coverage for new functionality
- Proper NatSpec documentation for all public functions
- Gas optimization considerations
- Security best practices compliance

## Project Structure

```
tuition-escrow-dapp/
├── contracts/                 # Smart contract source code
│   ├── TuitionEscrow.sol     # Main escrow contract
│   └── MockUSDC.sol          # Test token contract
├── test/                     # Comprehensive test suite
│   ├── TuitionEscrow.test.ts # Core functionality tests
│   └── Integration.test.ts   # End-to-end testing
├── scripts/                  # Deployment and utility scripts
├── ignition/modules/         # Hardhat Ignition deployment modules
├── deployments/              # Deployment artifacts and addresses
├── typechain-types/          # Generated TypeScript definitions
└── artifacts/                # Compiled contract artifacts
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## Audit Status

**Status**: Not audited - This is a development/educational project

For production deployments, a comprehensive security audit is strongly recommended before handling real funds.

## Support

For technical questions or issues:
- Create an issue in the GitHub repository
- Review existing documentation and test cases
- Check deployment guides for common troubleshooting steps

---

**Disclaimer**: This software is provided for educational and development purposes. Conduct thorough testing and security audits before any production deployment involving real funds.