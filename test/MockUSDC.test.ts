import { expect } from "chai";
import { ethers } from "hardhat";
import { MockUSDC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import "@nomicfoundation/hardhat-chai-matchers";

chai.use(chaiAsPromised);

describe("MockUSDC", function () {
  let mockUSDC: MockUSDC;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should have correct name and symbol", async function () {
      expect(await mockUSDC.name()).to.equal("Mock USD Coin");
      expect(await mockUSDC.symbol()).to.equal("mUSDC");
      expect(await mockUSDC.decimals()).to.equal(6);
    });

    it("Should mint initial supply to owner", async function () {
      const expectedSupply = ethers.parseUnits("10000000", 6); // 10M tokens
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(expectedSupply);
    });
  });

  describe("Faucet", function () {
    it("Should give tokens to users", async function () {
      await mockUSDC.connect(user1).faucet();
      
      const balance = await mockUSDC.balanceOf(user1.address);
      const expectedAmount = ethers.parseUnits("1000", 6);
      expect(balance).to.equal(expectedAmount);
    });

    it("Should prevent immediate second faucet use", async function () {
      await mockUSDC.connect(user1).faucet();
      
      await expect(
        mockUSDC.connect(user1).faucet()
      ).to.be.revertedWithCustomError(mockUSDC, "FaucetCooldownActive");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      
      await mockUSDC.connect(owner).mint(user1.address, mintAmount);
      
      expect(await mockUSDC.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should prevent non-owner from minting", async function () {
      const mintAmount = ethers.parseUnits("1000", 6);
      
      await expect(
        mockUSDC.connect(user1).mint(user1.address, mintAmount)
      ).to.be.revertedWithCustomError(mockUSDC, "OwnableUnauthorizedAccount");
    });
  });

  describe("Basic ERC20", function () {
    it("Should transfer tokens", async function () {
      const transferAmount = ethers.parseUnits("1000", 6);
      
      await mockUSDC.connect(owner).transfer(user1.address, transferAmount);
      
      expect(await mockUSDC.balanceOf(user1.address)).to.equal(transferAmount);
    });

    it("Should approve and transferFrom", async function () {
      const amount = ethers.parseUnits("1000", 6);
      
      await mockUSDC.connect(owner).approve(user1.address, amount);
      await mockUSDC.connect(user1).transferFrom(owner.address, user1.address, amount);
      
      expect(await mockUSDC.balanceOf(user1.address)).to.equal(amount);
    });
  });
});