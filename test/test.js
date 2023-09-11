const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");


let token;
let factory;
let capitalReserve;
let whitelistUser;
let whitelistUser2;
let reserveGov;
let admin;
let regulator;
let interestRate;
let user1;
let user2;
let user3;
let accidental;
let oneEth;
let halfEth;


describe ("Sample Token" , function(){
  let Token;
  let sampleToken;
  before(async function(){
    oneEth = 1000000000000000000n;
    halfEth = 500000000000000000n;
    Token = await ethers.getContractFactory("Currency");
    sampleToken = await Token.deploy("Reserve","TKN");
    await sampleToken.deployed();
    token = sampleToken;
  });

  it("Should return the same Name",async function(){
    expect(await sampleToken.name()).to.equal("Reserve");
  });

  it("Should return the same symbol",async function(){
    expect(await sampleToken.symbol()).to.equal("TKN");
  });

  it("Should return the same total Supply as of balance" , async function(){
    await sampleToken.mint(oneEth);
    
    expect(await sampleToken.totalSupply()).to.equal(oneEth);
  });
});

describe("Factory", function(){
  before(async function(){
    let Factory;
    let _factory;
    [admin, whitelistUser, whitelistUser2,reserveGov,regulator,user1,user2,user3,accidental] = await ethers.getSigners();
    Factory = await ethers.getContractFactory("Factory");
      _factory = await Factory.deploy();
      await _factory.deployed();
      factory = _factory;
  });
  
  it("Testing whiteslist operations",async function(){
    await factory.whitelist(whitelistUser.address);
    expect(await factory.isWhitelisted(whitelistUser.address)).to.equal(true);
  });

  it("Testing Maximum Interest operations", async function(){
    await factory.setMaxInterestLimit(1000000181000000000n);
    expect(await factory.allowableInterest()).to.equal(1000000181000000000n);
  });
  
  it("Testing Deploy Capital reserve operations", async function(){
    interestRate = factory.allowableInterest();
    await factory.deployCapitalReserve(reserveGov.address, regulator.address, token.address, interestRate, 10);
    expect(await factory.reserveCount()).to.equal(1);
  });
});



describe("Captial Reserve", function(){
  before(async function(){
    let Capital = await ethers.getContractFactory("CapitalReserve");
    capitalReserve = await Capital.deploy(reserveGov.address, regulator.address, token.address, interestRate, admin.address, factory.address, 10);
    await capitalReserve.deployed();
  });

  it("Testing Deposit to Interest Pool",async function(){
    await token.connect(reserveGov).mint(oneEth);
    expect(await token.balanceOf(reserveGov.address)).to.equal(oneEth);
    await token.connect(reserveGov).approve(capitalReserve.address, oneEth);
    await capitalReserve.connect(reserveGov).depositToInterestPool(oneEth);
    const {1: inte} = await capitalReserve.getPoolBalances();
    expect(await inte).to.equal(oneEth);
  });

  it("Testing Deposit to Capital Pool",async function(){
    await token.connect(whitelistUser).mint(oneEth);
    expect(await token.balanceOf(whitelistUser.address)).to.equal(oneEth);
    await token.connect(whitelistUser).approve(capitalReserve.address, oneEth);
    await capitalReserve.connect(whitelistUser).depositToCapitalReservePool(oneEth);
    const {0 : cap} = await capitalReserve.getPoolBalances();
    expect(await cap).to.equal(oneEth);
    expect(await capitalReserve.balanceOf(whitelistUser.address)).to.equal(oneEth);
  });

  it("Testing Continous Interest",async function(){
    await token.connect(whitelistUser).mint(oneEth);
    expect(await token.balanceOf(whitelistUser.address)).to.equal(oneEth);
    await token.connect(whitelistUser).approve(capitalReserve.address, oneEth);
    await capitalReserve.connect(whitelistUser).depositToCapitalReservePool(oneEth);
    
    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine");

    const {0 : cap} = await capitalReserve.getPoolBalances();
    expect(await cap).to.equal(2000000362000000000n);
  });

  it("Testing lp Tokens For Capital",async function(){
    await token.connect(whitelistUser2).mint(oneEth);
    expect(await token.balanceOf(whitelistUser2.address)).to.equal(oneEth);
    await token.connect(whitelistUser2).approve(capitalReserve.address, oneEth);
    await factory.whitelist(whitelistUser2.address);

    await capitalReserve.connect(whitelistUser2).depositToCapitalReservePool(oneEth);
    expect(await capitalReserve.balanceOf(whitelistUser2.address)).to.equal(999999819000032760n);
  });

  it("Testing Withdraw from Capital Pool and capital For Lp Tokens",async function(){
    await capitalReserve.connect(whitelistUser).withdrawFromCapitalReservePool(halfEth);
    expect(await token.balanceOf(whitelistUser.address)).to.equal(500000090500000000n);
  });

  it("Testing Safe Transfer for Pending transaction",async function(){
    capitalReserve.connect(reserveGov).setMaxTimeLimit(300);
    await capitalReserve.connect(whitelistUser).safeTransfer(user1.address, halfEth, ~~(Date.now() / 1000) + 300);
    expect(await capitalReserve.pendingTxnCount()).to.equal(1);    
  });

  it("Testing Claim Pending Transaction", async function(){
    await factory.whitelist(user1.address);
    let txnID = await capitalReserve.pendingTxnAtIndex(0);
    await capitalReserve.connect(user1).claimPendingTransaction(txnID);
    expect(await capitalReserve.balanceOf(user1.address)).to.equal(halfEth);
  });

  it("Testing Cancel Pending Transaction",async function(){
    await capitalReserve.connect(user1).safeTransfer(user2.address, halfEth, ~~(Date.now() / 1000) + 60);
    let txnID = await capitalReserve.pendingTxnAtIndex(0);
    expect(await capitalReserve.balanceOf(user1.address)).to.equal(0);

    await ethers.provider.send("evm_increaseTime", [60]);
    await ethers.provider.send("evm_mine");    
    
    await capitalReserve.connect(user1).cancelPendingTransaction(txnID);
    expect(await capitalReserve.balanceOf(user1.address)).to.equal(halfEth);
  });

  it("Testing SafeTransfer of tokens to known users", async function(){
    await factory.whitelist(user3.address);
    await capitalReserve.connect(whitelistUser).safeTransfer(user3.address, halfEth, ~~(Date.now() / 1000) + 300);
    expect(await capitalReserve.balanceOf(user3.address)).to.equal(halfEth);
  });

  it("Testing Transfer of tokens to known users", async function(){
    await capitalReserve.connect(whitelistUser).transfer(user3.address, halfEth);
    expect(await capitalReserve.balanceOf(user3.address)).to.equal(oneEth);
  });

  it("Testing Withdraw from Interest Pool",async function(){
    await capitalReserve.connect(reserveGov).withdrawFromInterestPool(halfEth);
    expect(await token.balanceOf(reserveGov.address)).to.equal(halfEth);
  });

  
  
  it("Testing Insolvency Case by Withdrawing all amount from Interest pool",async function(){
    const {0 : cap, 1: inte} = await capitalReserve.getPoolBalances();
    await capitalReserve.connect(reserveGov).withdrawFromInterestPool(inte); 
    const {1: interest} = await capitalReserve.getPoolBalances();
    expect(await interest).to.equal(0);

    /**
     * waiting for three time intervals to look if code throws any error
     */ 
    await ethers.provider.send("evm_increaseTime", [30]);
    await ethers.provider.send("evm_mine");
    
    const {0 : capital } = await capitalReserve.getPoolBalances();
    expect(await capital).to.equal(cap);
  });

  it("Testing Insolvency Case by letting it get empty",async function(){
    await token.connect(whitelistUser).mint(oneEth);
    await token.connect(whitelistUser).approve(capitalReserve.address, oneEth);
    await capitalReserve.connect(whitelistUser).depositToCapitalReservePool(oneEth);
    const {1:inte } = await capitalReserve.getPoolBalances();
    expect(await inte).to.equal(0);
    await token.connect(reserveGov).approve(capitalReserve.address, 362000000000);
    /**
     * 362000000000 = Interest on 1 eth after 2 intervals
     */ 
    await capitalReserve.connect(reserveGov).depositToInterestPool(362000000000);

      /**
       * waiting for five time intervals to look if code throws any error
       */
      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");

      const {1:interest} = await capitalReserve.getPoolBalances();
      expect(await interest).to.equal(0);
  });

  it("Testing Recovery of Locked tokens of same type",async function(){
    await token.connect(accidental).mint(oneEth);
    await token.connect(accidental).transfer(capitalReserve.address,oneEth);
    expect(await token.balanceOf(accidental.address)).to.equal(0);
    await capitalReserve.connect(reserveGov).recoverAccidentalTransfer(token.address, accidental.address);
    expect(await token.balanceOf(accidental.address)).to.equal(oneEth);
  });

  it("Testing Recovery of Locked tokens of different type",async function(){
    let Token;
    let sampleToken;
    Token = await ethers.getContractFactory("Currency");
    sampleToken = await Token.deploy("Temporary","TEMP");
    await sampleToken.deployed();
    await sampleToken.connect(accidental).mint(oneEth);
    await sampleToken.connect(accidental).transfer(capitalReserve.address,oneEth);
    expect(await sampleToken.balanceOf(accidental.address)).to.equal(0);
    await capitalReserve.connect(reserveGov).recoverAccidentalTransfer(sampleToken.address, accidental.address);
    expect(await sampleToken.balanceOf(accidental.address)).to.equal(oneEth);
  });
});
