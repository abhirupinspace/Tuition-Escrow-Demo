# EduPay Global - Cross-Border Education Payments

A modern, secure cross-border payment system for education using stablecoins. This frontend application provides an intuitive interface for students to pay tuition fees and make donations to universities worldwide, with admin controls for payment management.

## 🚀 Features

### For Students/Users
- **Wallet Integration**: Connect with MetaMask or other Web3 wallets
- **University Selection**: Choose from a curated list of global universities
- **Secure Payments**: Make payments using USDC stablecoin with escrow protection
- **Payment Tracking**: View complete payment history and status
- **Real-time Updates**: Get instant feedback on payment status

### For Administrators
- **Payment Review**: Review and approve pending payments
- **Admin Dashboard**: Comprehensive overview of payment statistics
- **Release/Refund**: Approve payments to universities or refund to users
- **Audit Trail**: Complete transaction history with blockchain verification

### Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Web3 Integration**: Ready for smart contract integration
- **Security First**: Escrow-based payment system

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Web3**: MetaMask integration (ready for Web3 libraries)
- **State Management**: React hooks and context
- **UI Components**: Radix UI primitives via shadcn/ui

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/edupay-global.git
   cd edupay-global
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables
Create a \`.env.local\` file in the root directory:

\`\`\`env
# Smart Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK_ID=11155111

# Admin Configuration
NEXT_PUBLIC_ADMIN_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1

# API Configuration (if needed)
NEXT_PUBLIC_API_URL=https://api.edupay.global
\`\`\`

### Smart Contract Integration
To integrate with your smart contract:

1. Update the contract addresses in your environment variables
2. Add the contract ABI to \`lib/contracts/\`
3. Implement Web3 provider in \`lib/web3.ts\`
4. Update the payment functions in components to call actual contract methods

## 🏗️ Project Structure

\`\`\`
├── app/
│   ├── components/          # React components
│   │   ├── wallet-connection.tsx
│   │   ├── payment-form.tsx
│   │   ├── admin-dashboard.tsx
│   │   └── payment-history.tsx
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Home page
├── components/ui/          # shadcn/ui components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
└── public/               # Static assets
\`\`\`

## 🎯 Usage

### For Students

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Select University**: Choose your target university from the dropdown
3. **Enter Details**: Input payment amount and invoice reference
4. **Submit Payment**: Review details and submit the payment
5. **Track Status**: Monitor payment status in the "Payment History" tab

### For Administrators

1. **Connect Admin Wallet**: Connect with the designated admin wallet address
2. **Access Admin Dashboard**: Navigate to the "Admin Dashboard" tab
3. **Review Payments**: View all pending payments requiring approval
4. **Take Action**: Release payments to universities or refund to users
5. **Monitor Statistics**: Track overall system performance and metrics

## 🔐 Security Features

- **Escrow Protection**: All payments are held in smart contract escrow
- **Admin Controls**: Multi-signature admin approval for payment release
- **Audit Trail**: Complete blockchain-based transaction history
- **Wallet Security**: Non-custodial wallet integration
- **Input Validation**: Comprehensive form validation and sanitization

## 🌐 Supported Networks

- **Sepolia Testnet** (Primary)
- **Ethereum Mainnet** (Production ready)
- **Polygon** (Lower fees)
- **Arbitrum** (L2 scaling)

## 📱 Browser Support

- Chrome/Chromium (Recommended)
- Firefox
- Safari
- Edge
- Mobile browsers with Web3 wallet support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@edupay.global
- Documentation: [docs.edupay.global](https://docs.edupay.global)

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Integration with more universities
- [ ] Support for additional stablecoins
- [ ] Advanced analytics dashboard
- [ ] Automated compliance reporting

---

Built with ❤️ for global education accessibility
\`\`\`
