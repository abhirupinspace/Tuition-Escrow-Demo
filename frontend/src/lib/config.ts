export const CONTRACT_ADDRESSES = {
  TUITION_ESCROW:
    (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
    ("0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1" as `0x${string}`),
  USDC:
    (process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}`) ||
    ("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as `0x${string}`), // Sepolia USDC
  ADMIN:
    (process.env.NEXT_PUBLIC_ADMIN_ADDRESS as `0x${string}`) ||
    ("0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1" as `0x${string}`),
}
