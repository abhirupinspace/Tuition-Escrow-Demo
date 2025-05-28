export const CONTRACT_ADDRESSES = {
  TUITION_ESCROW:
    (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
    ("0xd81AE6A442B19E8D1c742FB75bD248eBcC4f3D06" as `0x${string}`),
  USDC:
    (process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}`) ||
    ("0x466e34e422e7775e7EbB606c9F4cE870e9A2817e" as `0x${string}`), // Sepolia USDC
  ADMIN:
    (process.env.NEXT_PUBLIC_ADMIN_ADDRESS as `0x${string}`) ||
    ("0xC8df9cB27dD2736424333176323C1Bcef22E521A" as `0x${string}`),
}
