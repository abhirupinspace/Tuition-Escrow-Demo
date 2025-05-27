import { expect } from "chai";
import { TuitionEscrow, MockUSDC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";

describe("TuitionEscrow", function () {
  let tuitionEscrow: TuitionEscrow;
  let mockUSDC: MockUSDC;
  let owner: SignerWithAddress;
  let payer: SignerWithAddress;
  let university: SignerWithAddress;

  beforeEach(async function () {
    [owner, payer, university] = await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy(owner.address);

    // Deploy TuitionEscrow
    const TuitionEscrowFactory = await ethers.getContractFactory("TuitionEscrow");
    tuitionEscrow = await TuitionEscrowFactory.deploy(
      await mockUSDC.getAddress(),
      owner.address
    );

    // Give payer some tokens
    await mockUSDC.mint(payer.address, ethers.parseUnits("10000", 6));
  });

  describe("Deployment", function () {
    it("Should set correct owner", async function () {
      expect(await tuitionEscrow.owner()).to.equal(owner.address);
    });

    it("Should set correct stablecoin", async function () {
      expect(await tuitionEscrow.stablecoin()).to.equal(await mockUSDC.getAddress());
    });
  });

  describe("Initialize Payment", function () {
    it("Should create a payment", async function () {
      const amount = ethers.parseUnits("1000", 6);
      
      await tuitionEscrow.initialize(
        payer.address,
        university.address,
        amount,
        "INV-001"
      );

      const payment = await tuitionEscrow.getPayment(0);
      expect(payment.payer).to.equal(payer.address);
      expect(payment.university).to.equal(university.address);
      expect(payment.amount).to.equal(amount);
    });

    it("Should fail with zero amount", async function () {
      await expect(
        tuitionEscrow.initialize(payer.address, university.address, 0, "INV-001")
      ).to.be.revertedWithCustomError(tuitionEscrow, "InvalidAmount");
    });
  });

  describe("Deposit", function () {
    beforeEach(async function () {
      const amount = ethers.parseUnits("1000", 6);
      await tuitionEscrow.initialize(payer.address, university.address, amount, "INV-001");
    });

    it("Should deposit successfully", async function () {
      const amount = ethers.parseUnits("1000", 6);
      
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), amount);
      await tuitionEscrow.connect(payer).deposit(0);

      const payment = await tuitionEscrow.getPayment(0);
      expect(payment.status).to.equal(1); // DEPOSITED
    });

    it("Should fail without approval", async function () {
      await expect(
        tuitionEscrow.connect(payer).deposit(0)
      ).to.be.revertedWithCustomError(tuitionEscrow, "InsufficientBalance");
    });
  });

  describe("Release", function () {
    beforeEach(async function () {
      const amount = ethers.parseUnits("1000", 6);
      await tuitionEscrow.initialize(payer.address, university.address, amount, "INV-001");
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), amount);
      await tuitionEscrow.connect(payer).deposit(0);
    });

    it("Should release to university", async function () {
      await tuitionEscrow.connect(owner).release(0);

      const payment = await tuitionEscrow.getPayment(0);
      expect(payment.status).to.equal(2); // RELEASED
    });

    it("Should fail if not owner", async function () {
      await expect(
        tuitionEscrow.connect(payer).release(0)
      ).to.be.revertedWithCustomError(tuitionEscrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("Refund", function () {
    beforeEach(async function () {
      const amount = ethers.parseUnits("1000", 6);
      await tuitionEscrow.initialize(payer.address, university.address, amount, "INV-001");
      await mockUSDC.connect(payer).approve(await tuitionEscrow.getAddress(), amount);
      await tuitionEscrow.connect(payer).deposit(0);
    });

    it("Should refund to payer", async function () {
      await tuitionEscrow.connect(owner).refund(0);

      const payment = await tuitionEscrow.getPayment(0);
      expect(payment.status).to.equal(3); // REFUNDED
    });

    it("Should fail if not owner", async function () {
      await expect(
        tuitionEscrow.connect(payer).refund(0)
      ).to.be.revertedWithCustomError(tuitionEscrow, "OwnableUnauthorizedAccount");
    });
  });
});