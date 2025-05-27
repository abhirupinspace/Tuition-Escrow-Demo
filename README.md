# 🎓 Tuition Escrow dApp

A secure cross-border payment system using stablecoins (USDC) to facilitate tuition fee transfers between students and universities with admin-controlled escrow functionality.

## 🏗️ Architecture Overview

This dApp consists of:
- **TuitionEscrow.sol**: Main escrow contract with admin controls
- **MockUSDC.sol**: ERC20 stablecoin for testing (6 decimals like real USDC)
- **Comprehensive Test Suite**: 100% coverage with edge cases
- **Frontend**: React + TypeScript + Tailwind (coming next)

## ✨ Features

- ✅ **Secure Escrow**: Funds held safely until admin approval
- ✅ **Admin Controls**: Release or refund payments
- ✅ **Multi-Payment Support**: Track multiple payments per user/university
- ✅ **Gas Optimized**: Custom errors, efficient storage patterns
- ✅ **Emergency Controls**: Pause/unpause, emergency withdrawal
- ✅ **Event Logging**: Complete audit trail
- ✅ **Reentrancy Protection**: SafeERC20 + ReentrancyGuard
- ✅ **Testnet Ready**: Works on Sepolia with MockUSDC

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.19
- **Hardhat** + TypeScript
- **OpenZeppelin** contracts
- **ethers.js** v6
- **Chai** + Mocha testing

### Frontend (Next Phase)
- **Next.js** 15+
- **TypeScript**
- **Tailwind CSS**
- **wagmi** + viem
- **WalletConnect/MetaMask**

## 🚀 Quick Start

### Prerequisites

```bash
node >= 18.0.0
npm >= 8.0.0
git
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tuition-escrow-dapp.git
cd tuition-escrow-dapp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Setup

Edit `.env` file:

```bash
# Required for deployment
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Optional for verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas reporting
REPORT_GAS=true
```

## 📝 Smart Contract Details

### TuitionEscrow.sol

**Core Functions:**
- `initialize()` - Create new payment escrow
- `deposit()` - Payer deposits funds
- `release()` - Admin releases funds to university
- `refund()` - Admin refunds to payer

**Security Features:**
- Owner-only admin functions
- Reentrancy protection
- Pausable functionality
- Custom error messages
- SafeERC20 transfers

**Events:**
```solidity
event PaymentInitialized(uint256 indexed paymentId, address indexed payer, address indexed university, uint256 amount, string invoiceRef);
event Deposited(uint256 indexed paymentId, address indexed payer, uint256 amount);
event Released(uint256 indexed paymentId, address indexed university, uint256 amount);
event Refunded(uint256 indexed paymentId, address indexed payer, uint256 amount);
```

### MockUSDC.sol

**Features:**
- 6 decimals (like real USDC)
- Faucet function (1000 tokens per 24h)
- Mint/burn functionality
- Max supply: 100M tokens

## 🧪 Testing

### Run Tests

```bash
# Compile contracts
npm run compile

# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run coverage
npm run test:coverage
```

### Test Coverage

Our test suite covers:
- ✅ Contract deployment edge cases
- ✅ Payment initialization validation
- ✅ Deposit functionality and security
- ✅ Release/refund admin controls
- ✅ Access control mechanisms
- ✅ Emergency functions
- ✅ Gas optimization scenarios
- ✅ MockUSDC faucet mechanics

## 🚀 Deployment

### Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy to local network (new terminal)
npm run deploy:localhost
```

### Sepolia Testnet

```bash
# Deploy to Sepolia
npm run deploy:sepolia
```

### Using Hardhat Ignition

```bash
# Deploy with Ignition
npx hardhat ignition deploy ignition/modules/TuitionEscrowModule.ts --network sepolia
```

### Manual Deployment Steps

1. **Get Sepolia ETH**: Use [Sepolia Faucet](https://sepoliafaucet.com/)
2. **Configure .env**: Add your private key and Infura URL
3. **Deploy**: Run deployment script
4. **Verify**: Verify contracts on Etherscan

```bash
# Verify contracts (after deployment)
npx hardhat verify --network sepolia CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```

## 📊 Contract Addresses

After deployment, addresses will be saved in `deployments/` folder:

### Sepolia Testnet
```
TuitionEscrow: [Will be populated after deployment]
MockUSDC: [Will be populated after deployment]
```

## 💡 Usage Examples

### Initialize Payment

```typescript
const paymentId = await tuitionEscrow.initialize(
  payerAddress,
  universityAddress,
  ethers.parseUnits("1000", 6), // 1000 USDC
  "INV-2024-001"
);
```

### Deposit Funds

```typescript
// Approve first
await mockUSDC.connect(payer).approve(escrowAddress, amount);

// Then deposit
await tuitionEscrow.connect(payer).deposit(paymentId);
```

### Admin Actions

```typescript
// Release to university
await tuitionEscrow.connect(admin).release(paymentId);

// Or refund to payer
await tuitionEscrow.connect(admin).refund(paymentId);
```

## 🔒 Security Considerations

- **Admin Key Management**: Use multisig for production
- **Upgradability**: Contracts are not upgradeable by design
- **Pause Mechanism**: Admin can pause deposits in emergencies
- **Audit Recommended**: Get professional audit before mainnet

## 🎯 Frontend Integration (Next Steps)

The frontend will include:

1. **Wallet Connection**
   - MetaMask integration
   - WalletConnect support
   - Network switching

2. **Payment Interface**
   - University selection dropdown
   - Amount input with validation
   - Invoice reference field
   - Transaction status tracking

3. **Admin Dashboard**
   - Pending payments list
   - Release/refund controls
   - Analytics and reporting

4. **User Dashboard**
   - Payment history
   - Transaction status
   - Receipt downloads

## 🛣️ Development Roadmap

### Phase 1: Smart Contracts ✅
- [x] Core escrow functionality
- [x] MockUSDC for testing
- [x] Comprehensive test suite
- [x] Deployment scripts
- [x] Gas optimization

### Phase 2: Frontend (In Progress)
- [ ] React + TypeScript setup
- [ ] Wallet integration
- [ ] Payment forms
- [ ] Admin dashboard
- [ ] Transaction monitoring

### Phase 3: Production Ready
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Real USDC integration
- [ ] University partnerships
- [ ] KYC/Compliance integration

## 📋 API Reference

### TuitionEscrow Methods

| Method | Access | Description |
|--------|---------|-------------|
| `initialize(payer, university, amount, invoiceRef)` | Public | Create new payment |
| `deposit(paymentId)` | Payer Only | Deposit funds |
| `release(paymentId)` | Owner Only | Release to university |
| `refund(paymentId)` | Owner Only | Refund to payer |
| `getPayment(paymentId)` | View | Get payment details |
| `pause()/unpause()` | Owner Only | Emergency controls |

### MockUSDC Methods

| Method | Access | Description |
|--------|---------|-------------|
| `faucet()` | Public | Get test tokens (24h cooldown) |
| `mint(to, amount)` | Owner Only | Mint tokens |
| `burn(amount)` | Public | Burn own tokens |

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid Address" Error**
   - Check all addresses are valid (not zero address)
   - Ensure proper checksumming

2. **"Insufficient Balance" Error**
   - Check USDC balance and allowance
   - Use faucet for MockUSDC: `await mockUSDC.faucet()`

3. **"Payment Not Found" Error**
   - Verify payment ID exists
   - Check if payment was already processed

4. **Gas Issues**
   - Increase gas limit in hardhat.config.ts
   - Check gas price for testnet

### Debug Commands

```bash
# Check contract size
npx hardhat size-contracts

# Run specific test
npx hardhat test test/TuitionEscrow.test.ts

# Deploy with verbose logging
npx hardhat run scripts/deploy.ts --network sepolia --verbose
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Hardhat team for excellent development tools
- Ethereum Foundation for the platform

## 📞 Support

- Create an issue for bugs
- Discussions for questions
- Email: [your-email@domain.com]

---

**⚠️ Disclaimer**: This is educational/demo software. Conduct thorough testing and security audits before any production use.