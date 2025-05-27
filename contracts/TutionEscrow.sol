// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TuitionEscrow
 * @dev A secure escrow contract for cross-border tuition payments using stablecoins
 * @notice This contract allows users to make payments that are held in escrow until released by admin
 */
contract TuitionEscrow is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /// @dev Payment status enumeration
    enum PaymentStatus {
        INITIALIZED,    // Payment created but not deposited
        DEPOSITED,      // Funds deposited and held in escrow
        RELEASED,       // Funds released to university
        REFUNDED        // Funds refunded to payer
    }

    /// @dev Payment structure containing all payment details
    struct Payment {
        address payer;           // Address making the payment
        address university;      // University receiving the payment
        uint256 amount;          // Payment amount in stablecoin
        string invoiceRef;       // Reference to invoice/payment
        PaymentStatus status;    // Current payment status
        uint256 createdAt;       // Timestamp when payment was created
        uint256 depositedAt;     // Timestamp when funds were deposited
    }

    /// @dev The stablecoin token used for payments (e.g., USDC)
    IERC20 public immutable stablecoin;

    /// @dev Counter for generating unique payment IDs
    uint256 private _paymentIdCounter;

    /// @dev Mapping from payment ID to payment details
    mapping(uint256 => Payment) public payments;

    /// @dev Mapping from payer address to their payment IDs
    mapping(address => uint256[]) public payerPayments;

    /// @dev Mapping from university address to their payment IDs
    mapping(address => uint256[]) public universityPayments;

    // Events
    event PaymentInitialized(
        uint256 indexed paymentId,
        address indexed payer,
        address indexed university,
        uint256 amount,
        string invoiceRef
    );

    event Deposited(
        uint256 indexed paymentId,
        address indexed payer,
        uint256 amount
    );

    event Released(
        uint256 indexed paymentId,
        address indexed university,
        uint256 amount
    );

    event Refunded(
        uint256 indexed paymentId,
        address indexed payer,
        uint256 amount
    );

    // Custom errors for gas optimization
    error InvalidAmount();
    error InvalidAddress();
    error PaymentNotFound();
    error PaymentAlreadyProcessed();
    error PaymentNotDeposited();
    error UnauthorizedAccess();
    error InsufficientBalance();
    error TransferFailed();

    /**
     * @dev Constructor sets the stablecoin token address and initial owner
     * @param _stablecoin Address of the stablecoin token (e.g., USDC)
     * @param _owner Address of the contract owner (admin/custodian)
     */
    constructor(
        address _stablecoin,
        address _owner
    ) Ownable(_owner) {
        if (_stablecoin == address(0)) revert InvalidAddress();
        if (_owner == address(0)) revert InvalidAddress();
        
        stablecoin = IERC20(_stablecoin);
    }

    /**
     * @dev Initialize a new payment escrow
     * @param payer Address making the payment
     * @param university Address of the university receiving payment
     * @param amount Payment amount in stablecoin
     * @param invoiceRef Reference string for the invoice/payment
     * @return paymentId Unique identifier for the created payment
     */
    function initialize(
        address payer,
        address university,
        uint256 amount,
        string calldata invoiceRef
    ) external returns (uint256 paymentId) {
        if (payer == address(0) || university == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (bytes(invoiceRef).length == 0) revert InvalidAmount();

        paymentId = _paymentIdCounter++;

        payments[paymentId] = Payment({
            payer: payer,
            university: university,
            amount: amount,
            invoiceRef: invoiceRef,
            status: PaymentStatus.INITIALIZED,
            createdAt: block.timestamp,
            depositedAt: 0
        });

        // Track payments for both payer and university
        payerPayments[payer].push(paymentId);
        universityPayments[university].push(paymentId);

        emit PaymentInitialized(paymentId, payer, university, amount, invoiceRef);
    }

    /**
     * @dev Deposit funds for a specific payment
     * @param paymentId The ID of the payment to deposit funds for
     * @notice Only the designated payer can deposit funds
     */
    function deposit(uint256 paymentId) external nonReentrant whenNotPaused {
        Payment storage payment = payments[paymentId];
        
        if (payment.payer == address(0)) revert PaymentNotFound();
        if (msg.sender != payment.payer) revert UnauthorizedAccess();
        if (payment.status != PaymentStatus.INITIALIZED) revert PaymentAlreadyProcessed();

        // Check payer has sufficient balance and allowance
        uint256 balance = stablecoin.balanceOf(msg.sender);
        uint256 allowance = stablecoin.allowance(msg.sender, address(this));
        
        if (balance < payment.amount) revert InsufficientBalance();
        if (allowance < payment.amount) revert InsufficientBalance();

        // Update payment status before external call (CEI pattern)
        payment.status = PaymentStatus.DEPOSITED;
        payment.depositedAt = block.timestamp;

        // Transfer funds to escrow
        stablecoin.safeTransferFrom(msg.sender, address(this), payment.amount);

        emit Deposited(paymentId, msg.sender, payment.amount);
    }

    /**
     * @dev Release escrowed funds to the university
     * @param paymentId The ID of the payment to release
     * @notice Only the contract owner can release funds
     */
    function release(uint256 paymentId) external onlyOwner nonReentrant {
        Payment storage payment = payments[paymentId];
        
        if (payment.payer == address(0)) revert PaymentNotFound();
        if (payment.status != PaymentStatus.DEPOSITED) revert PaymentNotDeposited();

        // Update status before external call (CEI pattern)
        payment.status = PaymentStatus.RELEASED;

        // Transfer funds to university
        stablecoin.safeTransfer(payment.university, payment.amount);

        emit Released(paymentId, payment.university, payment.amount);
    }

    /**
     * @dev Refund escrowed funds to the payer
     * @param paymentId The ID of the payment to refund
     * @notice Only the contract owner can process refunds
     */
    function refund(uint256 paymentId) external onlyOwner nonReentrant {
        Payment storage payment = payments[paymentId];
        
        if (payment.payer == address(0)) revert PaymentNotFound();
        if (payment.status != PaymentStatus.DEPOSITED) revert PaymentNotDeposited();

        // Update status before external call (CEI pattern)
        payment.status = PaymentStatus.REFUNDED;

        // Transfer funds back to payer
        stablecoin.safeTransfer(payment.payer, payment.amount);

        emit Refunded(paymentId, payment.payer, payment.amount);
    }

    /**
     * @dev Get payment details by ID
     * @param paymentId The ID of the payment
     * @return Payment struct containing all payment details
     */
    function getPayment(uint256 paymentId) external view returns (Payment memory) {
        if (payments[paymentId].payer == address(0)) revert PaymentNotFound();
        return payments[paymentId];
    }

    /**
     * @dev Get all payment IDs for a specific payer
     * @param payer The payer address
     * @return Array of payment IDs
     */
    function getPayerPayments(address payer) external view returns (uint256[] memory) {
        return payerPayments[payer];
    }

    /**
     * @dev Get all payment IDs for a specific university
     * @param university The university address
     * @return Array of payment IDs
     */
    function getUniversityPayments(address university) external view returns (uint256[] memory) {
        return universityPayments[university];
    }

    /**
     * @dev Get the current payment ID counter
     * @return Current value of the payment counter
     */
    function getCurrentPaymentId() external view returns (uint256) {
        return _paymentIdCounter;
    }

    /**
     * @dev Get contract balance of stablecoin
     * @return Current balance held in escrow
     */
    function getContractBalance() external view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }

    /**
     * @dev Emergency pause function - only owner
     * @notice Pauses all deposit operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause function - only owner
     * @notice Resumes all operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdrawal function for owner
     * @param token Address of token to withdraw
     * @param amount Amount to withdraw
     * @notice Should only be used in emergencies
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}