import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { TuitionEscrow, MockUSDC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TuitionEscrow - Complete Test Suite", function () {
  let tuitionEscrow: TuitionEscrow;
  let mockUSDC: MockUSDC;
  let owner: SignerWithAddress;
  let payer: SignerWithAddress;
  let university: SignerWithAddress;
  let otherUser: SignerWithAddress;

  const INITIAL_TOKEN_SUPPLY = ethers.parseUnits("1000000", 6); // 1M tokens
  const PAYMENT_AMOUNT = ethers.parseUnits("1000", 6); // 1000 tokens

  beforeEach(async function () {
    console.log("\n🔧 Setting up test environment...");
    
    // Get signers
    [owner, payer, university, otherUser] = await ethers.getSigners();

    // Deploy MockUSDC token
    console.log("Deploying MockUSDC...");
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy(owner.address);
    console.log(`MockUSDC deployed to: ${await mockUSDC.getAddress()}`);

    // Deploy TuitionEscrow
    console.log("🏦 Deploying TuitionEscrow...");
    const TuitionEscrowFactory = await ethers.getContractFactory("TuitionEscrow");
    tuitionEscrow = await TuitionEscrowFactory.deploy(
      await mockUSDC.getAddress(),
      owner.address
    );
    console.log(`TuitionEscrow deployed to: ${await tuitionEscrow.getAddress()}`);

    // Give tokens to payer for testing
    console.log("Minting tokens for payer...");
    await mockUSDC.mint(payer.address, INITIAL_TOKEN_SUPPLY);
    const payerBalance = await mockUSDC.balanceOf(payer.address);
    console.log(`Payer balance: ${ethers.formatUnits(payerBalance, 6)} tokens\n`);
  });

  describe("🚀 Contract Deployment", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await tuitionEscrow.owner()).to.equal(owner.address);
      expect(await tuitionEscrow.stablecoin()).to.equal(await mockUSDC.getAddress());
      expect(await tuitionEscrow.getCurrentPaymentId()).to.equal(0);
    });

    it("Should have zero initial balance", async function () {
      expect(await tuitionEscrow.getContractBalance()).to.equal(0);
    });

    it("Should be unpaused initially", async function () {
      expect(await tuitionEscrow.paused()).to.be.false;
    });
  });

  describe("💼 Payment Initialization", function () {
    it("Should initialize a payment successfully", async function () {
      console.log("Initializing payment...");
      
      await expect(
        tuitionEscrow.initialize(
          payer.address,
          university.address,
          PAYMENT_AMOUNT,
          "INV-2024-001"
        )
      )
        .to.emit(tuitionEscrow, "PaymentInitialized")
        .withArgs(0, payer.address, university.address, PAYMENT_AMOUNT, "INV-2024-001");

      const payment = await tuitionEscrow.getPayment(0);
      expect(payment.payer).to.equal(payer.address);
      expect(payment.university).to.equal(university.address);
      expect(payment.amount).to.equal(PAYMENT_AMOUNT);
      expect(payment.invoiceRef).to.equal("INV-2024-001");
      expect(payment.status).to.equal(0); // INITIALIZED
      
      console.log("Payment initialized successfully");
    });

    it("Should increment payment counter", async function () {
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-001");
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-002");
      
      expect(await tuitionEscrow.getCurrentPaymentId()).to.equal(2);
    });

    it("Should track payments for payer and university", async function () {
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-001");
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-002");

      const payerPayments = await tuitionEscrow.getPayerPayments(payer.address);
      const universityPayments = await tuitionEscrow.getUniversityPayments(university.address);

      expect(payerPayments).to.deep.equal([0n, 1n]);
      expect(universityPayments).to.deep.equal([0n, 1n]);
    });

    describe("❌ Initialization Validation", function () {
      it("Should reject zero payer address", async function () {
        await expect(
          tuitionEscrow.initialize(ethers.ZeroAddress, university.address, PAYMENT_AMOUNT, "INV-001")
        ).to.be.revertedWithCustomError(tuitionEscrow, "InvalidAddress");
      });

      it("Should reject zero university address", async function () {
        await expect(
          tuitionEscrow.initialize(payer.address, ethers.ZeroAddress, PAYMENT_AMOUNT, "INV-001")
        ).to.be.revertedWithCustomError(tuitionEscrow, "InvalidAddress");
      });

      it("Should reject zero amount", async function () {
        await expect(
          tuitionEscrow.initialize(payer.address, university.address, 0, "INV-001")
        ).to.be.revertedWithCustomError(tuitionEscrow, "InvalidAmount");
      });

      it("Should reject empty invoice reference", async function () {
        await expect(
          tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "")
        ).to.be.revertedWithCustomError(tuitionEscrow, "InvalidAmount");
      });
    });
  });

  describe("💳 Payment Deposit", function () {
    beforeEach(async function () {
      // Initialize a payment for deposit tests
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-001");
    });

    it("Should deposit successfully", async function () {
      console.log("💰 Testing deposit flow...");
      
      // Approve tokens
      console.log("  Approving tokens...");
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), PAYMENT_AMOUNT);
      
      // Deposit
      console.log(" Depositing tokens...");
      await expect(tuitionEscrow.connect(payer).deposit(0))
        .to.emit(tuitionEscrow, "Deposited")
        .withArgs(0, payer.address, PAYMENT_AMOUNT);

      // Verify state changes
      const payment = await tuitionEscrow.getPayment(0);
      expect(payment.status).to.equal(1); // DEPOSITED
      expect(payment.depositedAt).to.be.gt(0);

      const contractBalance = await tuitionEscrow.getContractBalance();
      expect(contractBalance).to.equal(PAYMENT_AMOUNT);
      
      console.log("Deposit completed successfully");
    });

    it("Should update payer balance correctly", async function () {
      const initialBalance = await mockUSDC.balanceOf(payer.address);
      
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), PAYMENT_AMOUNT);
      await tuitionEscrow.connect(payer).deposit(0);
      
      const finalBalance = await mockUSDC.balanceOf(payer.address);
      expect(initialBalance - finalBalance).to.equal(PAYMENT_AMOUNT);
    });

    describe("Deposit Validation", function () {
      it("Should reject non-existent payment", async function () {
        await expect(
          tuitionEscrow.connect(payer).deposit(999)
        ).to.be.revertedWithCustomError(tuitionEscrow, "PaymentNotFound");
      });

      it("Should reject deposit from wrong address", async function () {
        await expect(
          tuitionEscrow.connect(otherUser).deposit(0)
        ).to.be.revertedWithCustomError(tuitionEscrow, "UnauthorizedAccess");
      });

      it("Should reject insufficient balance", async function () {
        // Use a user with no tokens
        await tuitionEscrow.initialize(otherUser.address, university.address, PAYMENT_AMOUNT, "INV-002");
        await mockUSDC.connect(otherUser).approve(await tuitionEscrow.getAddress(), PAYMENT_AMOUNT);
        
        await expect(
          tuitionEscrow.connect(otherUser).deposit(1)
        ).to.be.revertedWithCustomError(tuitionEscrow, "InsufficientBalance");
      });

      it("Should reject insufficient allowance", async function () {
        // Don't approve tokens
        await expect(
          tuitionEscrow.connect(payer).deposit(0)
        ).to.be.revertedWithCustomError(tuitionEscrow, "InsufficientBalance");
      });

      it("Should reject double deposit", async function () {
        await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), PAYMENT_AMOUNT);
        await tuitionEscrow.connect(payer).deposit(0);
        
        await expect(
          tuitionEscrow.connect(payer).deposit(0)
        ).to.be.revertedWithCustomError(tuitionEscrow, "PaymentAlreadyProcessed");
      });
    });
  });

  describe("🎓 Payment Release", function () {
    beforeEach(async function () {
      // Setup a deposited payment
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-001");
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), PAYMENT_AMOUNT);
      await tuitionEscrow.connect(payer).deposit(0);
    });

    it("Should release payment to university", async function () {
      console.log("🎓 Testing release flow...");
      
      const initialUniversityBalance = await mockUSDC.balanceOf(university.address);
      const initialContractBalance = await tuitionEscrow.getContractBalance();
      
      console.log("   🏦 Releasing payment...");
      await expect(tuitionEscrow.connect(owner).release(0))
        .to.emit(tuitionEscrow, "Released")
        .withArgs(0, university.address, PAYMENT_AMOUNT);

      // Verify university received funds
      const finalUniversityBalance = await mockUSDC.balanceOf(university.address);
      expect(finalUniversityBalance - initialUniversityBalance).to.equal(PAYMENT_AMOUNT);

      // Verify contract balance decreased
      const finalContractBalance = await tuitionEscrow.getContractBalance();
      expect(initialContractBalance - finalContractBalance).to.equal(PAYMENT_AMOUNT);

      // Verify payment status
      const payment = await tuitionEscrow.getPayment(0);
      expect(payment.status).to.equal(2); // RELEASED
      
      console.log("✅ Release completed successfully");
    });

    describe("❌ Release Validation", function () {
      it("Should reject release by non-owner", async function () {
        await expect(
          tuitionEscrow.connect(payer).release(0)
        ).to.be.revertedWithCustomError(tuitionEscrow, "OwnableUnauthorizedAccount");
      });

      it("Should reject release of non-deposited payment", async function () {
        await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-002");
        
        await expect(
          tuitionEscrow.connect(owner).release(1)
        ).to.be.revertedWithCustomError(tuitionEscrow, "PaymentNotDeposited");
      });

      it("Should reject double release", async function () {
        await tuitionEscrow.connect(owner).release(0);
        
        await expect(
          tuitionEscrow.connect(owner).release(0)
        ).to.be.revertedWithCustomError(tuitionEscrow, "PaymentNotDeposited");
      });
    });
  });

  describe("🔄 Payment Refund", function () {
    beforeEach(async function () {
      // Setup a deposited payment
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-001");
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), PAYMENT_AMOUNT);
      await tuitionEscrow.connect(payer).deposit(0);
    });

    it("Should refund payment to payer", async function () {
      console.log("🔄 Testing refund flow...");
      
      const initialPayerBalance = await mockUSDC.balanceOf(payer.address);
      const initialContractBalance = await tuitionEscrow.getContractBalance();
      
      console.log("   💸 Processing refund...");
      await expect(tuitionEscrow.connect(owner).refund(0))
        .to.emit(tuitionEscrow, "Refunded")
        .withArgs(0, payer.address, PAYMENT_AMOUNT);

      // Verify payer received refund
      const finalPayerBalance = await mockUSDC.balanceOf(payer.address);
      expect(finalPayerBalance - initialPayerBalance).to.equal(PAYMENT_AMOUNT);

      // Verify contract balance decreased
      const finalContractBalance = await tuitionEscrow.getContractBalance();
      expect(initialContractBalance - finalContractBalance).to.equal(PAYMENT_AMOUNT);

      // Verify payment status
      const payment = await tuitionEscrow.getPayment(0);
      expect(payment.status).to.equal(3); // REFUNDED
      
      console.log("✅ Refund completed successfully");
    });

    describe("❌ Refund Validation", function () {
      it("Should reject refund by non-owner", async function () {
        await expect(
          tuitionEscrow.connect(payer).refund(0)
        ).to.be.revertedWithCustomError(tuitionEscrow, "OwnableUnauthorizedAccount");
      });

      it("Should reject refund of non-deposited payment", async function () {
        await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-002");
        
        await expect(
          tuitionEscrow.connect(owner).refund(1)
        ).to.be.revertedWithCustomError(tuitionEscrow, "PaymentNotDeposited");
      });
    });
  });

  describe("👀 View Functions", function () {
    beforeEach(async function () {
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-001");
    });

    it("Should return correct payment details", async function () {
      const payment = await tuitionEscrow.getPayment(0);
      
      expect(payment.payer).to.equal(payer.address);
      expect(payment.university).to.equal(university.address);
      expect(payment.amount).to.equal(PAYMENT_AMOUNT);
      expect(payment.invoiceRef).to.equal("INV-001");
      expect(payment.status).to.equal(0); // INITIALIZED
      expect(payment.createdAt).to.be.gt(0);
      expect(payment.depositedAt).to.equal(0);
    });

    it("Should reject non-existent payment", async function () {
      await expect(
        tuitionEscrow.getPayment(999)
      ).to.be.revertedWithCustomError(tuitionEscrow, "PaymentNotFound");
    });

    it("Should return empty arrays for addresses with no payments", async function () {
      const payerPayments = await tuitionEscrow.getPayerPayments(otherUser.address);
      const universityPayments = await tuitionEscrow.getUniversityPayments(otherUser.address);
      
      expect(payerPayments).to.deep.equal([]);
      expect(universityPayments).to.deep.equal([]);
    });
  });

  describe("⚠️ Emergency Functions", function () {
    it("Should pause and unpause contract", async function () {
      console.log("⏸️ Testing pause functionality...");
      
      // Pause contract
      await tuitionEscrow.connect(owner).pause();
      expect(await tuitionEscrow.paused()).to.be.true;
      
      // Try to deposit while paused (should fail)
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-001");
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), PAYMENT_AMOUNT);
      
      await expect(
        tuitionEscrow.connect(payer).deposit(0)
      ).to.be.revertedWithCustomError(tuitionEscrow, "EnforcedPause");
      
      // Unpause contract
      await tuitionEscrow.connect(owner).unpause();
      expect(await tuitionEscrow.paused()).to.be.false;
      
      // Should work after unpause
      await tuitionEscrow.connect(payer).deposit(0);
      
      console.log("✅ Pause/unpause working correctly");
    });

    it("Should allow emergency withdrawal", async function () {
      // Setup deposited payment
      await tuitionEscrow.initialize(payer.address, university.address, PAYMENT_AMOUNT, "INV-001");
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), PAYMENT_AMOUNT);
      await tuitionEscrow.connect(payer).deposit(0);
      
      const initialOwnerBalance = await mockUSDC.balanceOf(owner.address);
      
      // Emergency withdrawal
      await tuitionEscrow.connect(owner).emergencyWithdraw(
        await mockUSDC.getAddress(),
        PAYMENT_AMOUNT
      );
      
      const finalOwnerBalance = await mockUSDC.balanceOf(owner.address);
      expect(finalOwnerBalance - initialOwnerBalance).to.equal(PAYMENT_AMOUNT);
    });

    it("Should reject emergency functions from non-owner", async function () {
      await expect(
        tuitionEscrow.connect(payer).pause()
      ).to.be.revertedWithCustomError(tuitionEscrow, "OwnableUnauthorizedAccount");
      
      await expect(
        tuitionEscrow.connect(payer).emergencyWithdraw(await mockUSDC.getAddress(), 100)
      ).to.be.revertedWithCustomError(tuitionEscrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("📊 Multiple Payments Scenario", function () {
    it("Should handle multiple payments efficiently", async function () {
      console.log("📊 Testing multiple payments...");
      
      const paymentCount = 5;
      const singleAmount = ethers.parseUnits("100", 6);
      const totalAmount = singleAmount * BigInt(paymentCount);
      
      // Create multiple payments
      console.log(`   📝 Creating ${paymentCount} payments...`);
      for (let i = 0; i < paymentCount; i++) {
        await tuitionEscrow.initialize(
          payer.address,
          university.address,
          singleAmount,
          `BATCH-${i}`
        );
      }
      
      // Approve total amount
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), totalAmount);
      
      // Deposit for all payments
      console.log("   💳 Depositing for all payments...");
      for (let i = 0; i < paymentCount; i++) {
        await tuitionEscrow.connect(payer).deposit(i);
      }
      
      // Verify contract state
      expect(await tuitionEscrow.getCurrentPaymentId()).to.equal(paymentCount);
      expect(await tuitionEscrow.getContractBalance()).to.equal(totalAmount);
      
      // Release some, refund others
      console.log("   🎓 Processing releases and refunds...");
      await tuitionEscrow.connect(owner).release(0);
      await tuitionEscrow.connect(owner).release(1);
      await tuitionEscrow.connect(owner).refund(2);
      await tuitionEscrow.connect(owner).refund(3);
      
      // Verify final states
      expect((await tuitionEscrow.getPayment(0)).status).to.equal(2); // RELEASED
      expect((await tuitionEscrow.getPayment(1)).status).to.equal(2); // RELEASED
      expect((await tuitionEscrow.getPayment(2)).status).to.equal(3); // REFUNDED
      expect((await tuitionEscrow.getPayment(3)).status).to.equal(3); // REFUNDED
      expect((await tuitionEscrow.getPayment(4)).status).to.equal(1); // DEPOSITED
      
      console.log("✅ Multiple payments handled successfully");
    });
  });
});