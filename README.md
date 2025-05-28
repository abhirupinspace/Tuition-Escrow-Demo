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

# TuitionEscrow Contract ABI and Integration Guide

## Contract Address

**Sepolia Testnet**: `0xd81AE6A442B19E8D1c742FB75bD248eBcC4f3D06`
https://sepolia.etherscan.io/address/0xd81AE6A442B19E8D1c742FB75bD248eBcC4f3D06
**Test Token (mUSDC)**: `0x466e34e422e7775e7EbB606c9F4cE870e9A2817e`

## Contract ABI

The complete ABI is available in `artifacts/contracts/TuitionEscrow.sol/TuitionEscrow.json` after compilation.

### Key Function Signatures

```json
[
  {
    "type": "function",
    "name": "initialize",
    "inputs": [
      {"name": "payer", "type": "address"},
      {"name": "university", "type": "address"},
      {"name": "amount", "type": "uint256"},
      {"name": "invoiceRef", "type": "string"}
    ],
    "outputs": [{"name": "paymentId", "type": "uint256"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "deposit",
    "inputs": [{"name": "paymentId", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "release",
    "inputs": [{"name": "paymentId", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "refund",
    "inputs": [{"name": "paymentId", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getPayment",
    "inputs": [{"name": "paymentId", "type": "uint256"}],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "components": [
          {"name": "payer", "type": "address"},
          {"name": "university", "type": "address"},
          {"name": "amount", "type": "uint256"},
          {"name": "invoiceRef", "type": "string"},
          {"name": "status", "type": "uint8"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "depositedAt", "type": "uint256"}
        ]
      }
    ],
    "stateMutability": "view"
  }
]
```

### Event Signatures

```json
[
  {
    "type": "event",
    "name": "PaymentInitialized",
    "inputs": [
      {"name": "paymentId", "type": "uint256", "indexed": true},
      {"name": "payer", "type": "address", "indexed": true},
      {"name": "university", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false},
      {"name": "invoiceRef", "type": "string", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "Deposited",
    "inputs": [
      {"name": "paymentId", "type": "uint256", "indexed": true},
      {"name": "payer", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "Released",
    "inputs": [
      {"name": "paymentId", "type": "uint256", "indexed": true},
      {"name": "university", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "Refunded",
    "inputs": [
      {"name": "paymentId", "type": "uint256", "indexed": true},
      {"name": "payer", "type": "address", "indexed": true},
      {"name": "amount", "type": "uint256", "indexed": false}
    ]
  }
]
```
# Project Assumptions and Design Decisions

## Technical Assumptions

### Blockchain and Network
- **Network Choice**: Sepolia testnet chosen for development and demonstration purposes
- **Gas Costs**: Assumes reasonable gas prices for transaction execution
- **Network Reliability**: Depends on Ethereum network uptime and consensus
- **Block Confirmation**: Standard 12+ block confirmations for transaction finality

### Token Standards
- **ERC20 Compliance**: All tokens follow standard ERC20 interface
- **Decimal Precision**: USDC and compatible tokens use 6 decimal places
- **Token Behavior**: Assumes standard transfer mechanics without fees or rebasing
- **Token Availability**: Sufficient liquidity exists for intended transaction volumes

### Smart Contract Assumptions
- **Immutability**: Contracts are not upgradeable by design for security
- **Owner Security**: Single owner model assumes secure key management
- **Gas Limits**: Functions designed to execute within reasonable gas limits
- **State Consistency**: Ethereum guarantees atomic transaction execution

## Business Logic Assumptions

### Payment Flow
- **Linear Process**: Payments follow Initialize → Deposit → Release/Refund sequence
- **Single Deposit**: Each payment requires exactly one deposit transaction
- **Final States**: Released and Refunded payments cannot be modified
- **Administrative Oversight**: All releases and refunds require admin approval

### User Roles and Permissions
- **Three-Party System**: Payer (student), University (recipient), Admin (operator)
- **Admin Trust Model**: Single administrative entity with release/refund authority
- **Payer Identity**: Payer address represents the student making payment
- **University Verification**: University addresses are trusted without additional verification

### Payment Lifecycle
- **Payment Uniqueness**: Each payment has unique ID and cannot be duplicated
- **Time Constraints**: No automatic expiration or time-based releases
- **Amount Immutability**: Payment amounts cannot be modified after initialization
- **Reference Integrity**: Invoice references are stored but not validated for uniqueness

## Security Assumptions

### Trust Model
- **Admin Authority**: Contract owner acts in good faith and maintains operational security
- **Multi-sig Consideration**: Production deployments should use multi-signature wallets
- **Key Management**: Private keys are stored securely and not compromised
- **Operational Security**: Administrative actions are performed by authorized personnel

### Attack Vectors Addressed
- **Reentrancy**: Protected via OpenZeppelin ReentrancyGuard
- **Integer Overflow**: Solidity ^0.8.0 has built-in overflow protection
- **Access Control**: Owner-only functions properly restricted
- **Input Validation**: Comprehensive parameter checking implemented

### External Dependencies
- **OpenZeppelin Libraries**: Trusted, audited implementations for security primitives
- **Solidity Compiler**: Assumes compiler correctness and lack of critical bugs
- **Token Contracts**: External ERC20 tokens behave according to standard

## Operational Assumptions

### User Experience
- **Web3 Wallets**: Users have MetaMask or compatible wallet installed
- **Network Configuration**: Users can connect to Sepolia testnet
- **Token Acquisition**: Users can obtain test tokens for transactions
- **Transaction Fees**: Users understand and can pay gas fees

### System Integration
- **Off-chain Systems**: External systems may track payments via events
- **University Integration**: Universities have systems to monitor received payments
- **Compliance**: Legal and regulatory compliance handled at application layer
- **Dispute Resolution**: Disputes resolved through administrative controls

### Scalability Considerations
- **Transaction Volume**: System designed for moderate transaction throughput
- **Storage Costs**: On-chain storage usage optimized for essential data only
- **Event Logging**: Events provide sufficient data for off-chain indexing
- **Network Congestion**: May require gas price adjustments during high congestion

## Design Trade-offs

### Decentralization vs. Control
- **Administrative Control**: Chose admin oversight over fully decentralized automation
- **Flexibility**: Manual release/refund provides flexibility for dispute resolution
- **Trust Requirements**: Requires trust in administrative entity

### Security vs. Usability
- **Immutable Contracts**: Enhanced security but limited upgrade capability
- **Multi-step Process**: Secure but requires multiple user transactions
- **Owner-only Functions**: Simple but centralized control model

### Gas Efficiency vs. Features
- **Custom Errors**: Gas-efficient error handling over descriptive strings
- **Minimal Storage**: Essential data only to reduce gas costs
- **Batch Operations**: Not implemented to maintain simplicity

## Limitations and Constraints

### Current Implementation
- **Single Token Support**: Designed for one stablecoin type per deployment
- **Manual Administration**: No automated release mechanisms
- **No Partial Payments**: Full amount must be deposited at once
- **Limited Metadata**: Minimal on-chain payment information

### Future Considerations
- **Multi-token Support**: Would require contract modifications
- **Automated Releases**: Could implement time-based or condition-based releases
- **Partial Refunds**: Current design only supports full refunds
- **Advanced Features**: Oracle integration, yield earning, etc.

### Production Considerations
- **Audit Requirements**: Professional security audit recommended before mainnet
- **Legal Compliance**: KYC/AML requirements not addressed in smart contract
- **Regulatory Oversight**: May require additional compliance measures
- **Insurance**: Consider insurance coverage for large fund holdings

## Testing Assumptions

### Test Environment
- **Local Testing**: Hardhat network provides sufficient testing environment
- **Test Coverage**: Current tests cover primary use cases and error conditions
- **Mock Tokens**: MockUSDC adequately represents real USDC behavior
- **Gas Estimation**: Test gas usage represents production gas consumption

### Integration Testing
- **Wallet Integration**: Standard wallet behavior assumed
- **Network Interaction**: Testnet behavior mirrors mainnet for relevant features
- **Event Monitoring**: Event emission tested but not full indexing pipeline
- **Error Handling**: Frontend error handling tested with standard error patterns