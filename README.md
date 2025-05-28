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
- **Network Choice**: Sepolia testnet selected for demonstration purposes; production would use Ethereum mainnet with proper gas optimization strategies
- **Gas Cost Management**: Functions designed to stay under 300k gas limit per transaction for predictable costs
- **Network Reliability**: Production deployment assumes 99.9% network uptime with fallback RPC endpoints
- **Transaction Finality**: 12-block confirmation requirement for irreversible payment processing

### Token Standards
- **ERC20 Compliance**: All integrated tokens must implement standard ERC20 interface without non-standard behaviors
- **Decimal Precision**: USDC standard of 6 decimals maintained for consistency with existing DeFi ecosystem
- **Token Security**: External tokens assumed to be audited and non-malicious (no fee-on-transfer or rebasing tokens)
- **Liquidity Requirements**: Minimum $10M daily volume on integrated stablecoins for operational stability

### Smart Contract Architecture
- **Immutable Design**: Contracts are intentionally non-upgradeable to eliminate upgrade risks and ensure trust
- **Gas Optimization**: Custom errors used instead of string reverts to reduce gas costs by ~50%
- **Storage Efficiency**: Struct packing optimizes storage slots to minimize SSTORE operations
- **Event-Driven Architecture**: All state changes emit events for reliable off-chain monitoring

## Business Logic Assumptions

### Payment Processing
- **Sequential Processing**: Payments follow strict Initialize → Deposit → Release/Refund workflow to prevent race conditions
- **Atomic Operations**: Each payment processed completely or fails entirely - no partial states
- **Administrative Approval**: All releases require explicit admin approval to comply with regulatory oversight requirements
- **Payment Immutability**: Once initialized, payment parameters cannot be modified to prevent manipulation

### Stakeholder Model
- **Three-Party System**: Clear separation between payer (student), payee (university), and administrator (service provider)
- **Administrative Trust**: Single admin model acceptable for MVP; production requires multi-signature governance
- **University Onboarding**: Pre-approved university addresses to prevent payments to unauthorized recipients
- **Student Verification**: KYC/identity verification handled at application layer, not smart contract level

### Financial Operations
- **Full Payment Model**: Complete tuition amount must be deposited at once - no installment payments in current version
- **No Interest Accrual**: Escrowed funds do not earn yield during holding period for simplicity
- **Refund Policy**: Full refunds only - partial refunds would require additional business logic complexity
- **Fee Structure**: No protocol fees in current implementation; can be added in future versions

## Security Assumptions

### Trust and Risk Model
- **Admin Key Security**: Assumes proper operational security practices for admin private keys
- **Multi-sig Requirement**: Production deployment requires 2-of-3 or 3-of-5 multi-signature wallet for admin functions
- **Regulatory Compliance**: AML/KYC compliance handled at application layer through traditional banking partners
- **Insurance Coverage**: Large fund holdings should be covered by DeFi insurance protocols

### Threat Mitigation
- **Reentrancy Protection**: OpenZeppelin ReentrancyGuard prevents complex reentrancy attacks
- **Access Control Validation**: All state-changing functions include proper permission checks
- **Input Sanitization**: Comprehensive validation prevents invalid state transitions
- **Emergency Controls**: Pause functionality allows rapid response to discovered vulnerabilities

### External Dependencies
- **Library Trust**: OpenZeppelin contracts are industry-standard and regularly audited
- **Token Contract Reliability**: External ERC20 tokens assumed to be legitimate and non-malicious
- **RPC Provider Redundancy**: Multiple RPC endpoints required for production reliability
- **Block Reorganization Handling**: 12+ block confirmations prevent issues from chain reorganizations

## Operational Assumptions

### User Experience Requirements
- **Web3 Literacy**: Target users comfortable with MetaMask/WalletConnect and basic DeFi operations
- **Network Management**: Users can switch networks and manage gas fees appropriately
- **Token Management**: Users understand token approvals and can obtain required test/production tokens
- **Transaction Monitoring**: Users can track transaction status and understand confirmation requirements

### Integration Requirements
- **University Systems**: Partner institutions have treasury systems capable of receiving and tracking crypto payments
- **Accounting Integration**: Universities can integrate on-chain transaction data with existing financial systems
- **Compliance Reporting**: All transactions generate audit trails compatible with educational institution requirements
- **Customer Support**: Clear escalation path for technical issues and payment disputes

### Performance Expectations
- **Transaction Throughput**: System designed for 100-1000 payments per day initially, scalable to 10k+ with L2 integration
- **Response Times**: Contract interactions complete within 15 seconds under normal network conditions
- **Event Processing**: Off-chain systems can process and react to contract events within 1-2 blocks
- **Data Availability**: Historical payment data remains accessible indefinitely via blockchain explorers

## Design Trade-offs and Rationale

### Centralization vs. Decentralization
- **Administrative Control**: Chose admin oversight over DAO governance for regulatory compliance and rapid dispute resolution
- **Operational Efficiency**: Manual controls allow for complex dispute resolution that pure automation cannot handle
- **Regulatory Alignment**: Centralized administration meets traditional financial service compliance requirements

### Security vs. Functionality
- **Immutable Contracts**: Prioritized security and trust over upgrade flexibility
- **Simple Role Model**: Single admin role reduces complexity while maintaining necessary controls
- **Conservative Approach**: Avoided complex features (partial payments, automated releases) to minimize attack surface

### Cost vs. Features
- **Gas Optimization**: Custom errors and efficient storage prioritized over extensive feature set
- **Event-Based Architecture**: Comprehensive logging without expensive on-chain storage
- **Minimal On-Chain Data**: Only essential payment data stored on-chain to control costs

## Production Deployment Considerations

### Technical Requirements
- **Security Audit**: Third-party audit by reputable firm (Consensys Diligence, Trail of Bits, etc.)
- **Multi-sig Implementation**: Gnosis Safe or similar for administrative functions
- **Monitoring Infrastructure**: Real-time alerting for unusual contract activity
- **Backup Systems**: Multiple RPC providers and event processing redundancy

### Business Requirements
- **Legal Framework**: Clear terms of service and dispute resolution procedures
- **Regulatory Compliance**: Consultation with financial services lawyers regarding money transmission laws
- **Insurance Coverage**: Professional liability and smart contract coverage
- **Partner Integration**: Formal agreements with participating universities

### Operational Requirements
- **24/7 Monitoring**: Administrative team available for urgent payment processing
- **Incident Response**: Clear procedures for handling smart contract issues or disputes
- **Documentation**: Comprehensive user guides for all stakeholder types
- **Support Infrastructure**: Help desk and technical support for users

## Known Limitations

### Current Implementation Constraints
- **Single Token Support**: Only one stablecoin per contract deployment
- **Binary Payment States**: No partial release or complex payment structures
- **Manual Administration**: No automated release triggers based on external conditions
- **Limited Metadata**: Minimal on-chain payment information to control gas costs

### Scalability Considerations
- **Gas Cost Scaling**: Higher network congestion increases transaction costs proportionally
- **Storage Growth**: Payment history grows linearly with usage, affecting node requirements
- **Event Processing**: High transaction volume may require sophisticated off-chain indexing
- **Admin Bottleneck**: Single admin model may become operational constraint at scale

### Future Enhancement Requirements
- **Layer 2 Integration**: Polygon, Arbitrum, or Optimism deployment for cost reduction
- **Multi-token Support**: Support for multiple stablecoins and automatic conversion
- **Advanced Features**: Time-locked releases, partial payments, yield generation
- **DAO Governance**: Transition to decentralized governance model for protocol parameters

## Risk Assessment

### Technical Risks
- **Smart Contract Bugs**: Mitigated through extensive testing and planned security audit
- **Network Congestion**: Managed through dynamic gas pricing and L2 options
- **Key Management**: Addressed through multi-signature requirements and hardware security modules
- **Dependency Risks**: OpenZeppelin library updates monitored and tested before adoption

### Business Risks
- **Regulatory Changes**: Monitoring of evolving crypto regulations in target jurisdictions
- **Market Volatility**: Stablecoin depegging risks managed through multiple token support
- **Adoption Challenges**: User education and onboarding programs planned
- **Competition**: Differentiation through superior user experience and institutional partnerships

### Operational Risks
- **Admin Availability**: Redundant admin access and clear escalation procedures
- **Technical Support**: Comprehensive documentation and user support systems
- **System Reliability**: Multiple RPC providers and monitoring infrastructure
- **Data Integrity**: Event-based architecture ensures payment tracking reliability