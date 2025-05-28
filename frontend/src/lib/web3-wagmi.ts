import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseUnits, formatUnits, type Address } from "viem"
import { TUITION_ESCROW_ABI, USDC_ABI, CONTRACT_ADDRESSES } from "./web3"

// Custom hooks for contract interactions using Wagmi

export function useUSDCBalance(address?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USDC as Address,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

export function useUSDCAllowance(owner?: Address, spender?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.USDC as Address,
    abi: USDC_ABI,
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!(owner && spender),
    },
  })
}

export function useContractBalance() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
    abi: TUITION_ESCROW_ABI,
    functionName: "getContractBalance",
  })
}

export function useContractPaused() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
    abi: TUITION_ESCROW_ABI,
    functionName: "paused",
  })
}

export function usePayment(paymentId?: number) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
    abi: TUITION_ESCROW_ABI,
    functionName: "getPayment",
    args: paymentId !== undefined ? [BigInt(paymentId)] : undefined,
    query: {
      enabled: paymentId !== undefined,
    },
  })
}

export function usePayerPayments(payerAddress?: Address) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
    abi: TUITION_ESCROW_ABI,
    functionName: "getPayerPayments",
    args: payerAddress ? [payerAddress] : undefined,
    query: {
      enabled: !!payerAddress,
    },
  })
}

export function useCurrentPaymentId() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
    abi: TUITION_ESCROW_ABI,
    functionName: "getCurrentPaymentId",
  })
}

// Write contract hooks
export function useApproveUSDC() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const approve = (amount: string) => {
    const amountWei = parseUnits(amount, 6)
    writeContract({
      address: CONTRACT_ADDRESSES.USDC as Address,
      abi: USDC_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.TUITION_ESCROW as Address, amountWei],
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    approve,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useInitializePayment() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const initialize = (payer: Address, university: Address, amount: string, invoiceRef: string) => {
    const amountWei = parseUnits(amount, 6)
    writeContract({
      address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
      abi: TUITION_ESCROW_ABI,
      functionName: "initialize",
      args: [payer, university, amountWei, invoiceRef],
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    initialize,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useDepositPayment() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const deposit = (paymentId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
      abi: TUITION_ESCROW_ABI,
      functionName: "deposit",
      args: [BigInt(paymentId)],
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    deposit,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useReleasePayment() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const release = (paymentId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
      abi: TUITION_ESCROW_ABI,
      functionName: "release",
      args: [BigInt(paymentId)],
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    release,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useRefundPayment() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const refund = (paymentId: number) => {
    writeContract({
      address: CONTRACT_ADDRESSES.TUITION_ESCROW as Address,
      abi: TUITION_ESCROW_ABI,
      functionName: "refund",
      args: [BigInt(paymentId)],
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    refund,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

// Utility functions
export function formatUSDCAmount(amount: bigint): string {
  return formatUnits(amount, 6)
}

export function parseUSDCAmount(amount: string): bigint {
  return parseUnits(amount, 6)
}
