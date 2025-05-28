import { http, cookieStorage, createConfig, createStorage } from "wagmi"
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors"
import { sepolia } from "viem/chains"

// We'll use the official sepolia chain from viem instead of defining our own
// This ensures we have the correct chain configuration

export function getConfig() {
  return createConfig({
    chains: [sepolia],
    connectors: [
      injected(),
      coinbaseWallet({
        appName: "EduPay Global",
        appLogoUrl: "https://edupay.global/logo.png",
      }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "your-project-id-here",
        metadata: {
          name: "EduPay Global",
          description: "Cross-border education payments using stablecoins",
          url: "https://edupay.global",
          icons: ["https://edupay.global/logo.png"],
        },
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [sepolia.id]: http("https://eth-sepolia.g.alchemy.com/v2/demo"), // Using Alchemy's public endpoint
    },
  })
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
