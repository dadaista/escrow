const Escrow = artifacts.require("Escrow");

var BN = web3.utils.BN;

const chai = require('chai');

const should = chai
  .use(require('chai-as-promised'))
  .should();

contract('e-scrow', function ([customer, supplier, arbiter]) {

  var escrow;
  

  beforeEach(async function () {
    console.log("customer:"+customer);
    escrow = await Escrow.new(customer,supplier,arbiter);
    console.log("escrow:"+escrow.address);
    let bal = await web3.eth.getBalance(escrow.address);
    console.log('bal:'+bal);
    assert.equal( bal , 0);
    await escrow.sendTransaction({from:customer,value:1000});
    bal = await web3.eth.getBalance(escrow.address);
    assert.equal( bal , 1000);
    console.log("bal:"+bal);
  });


  it('nobody can withdraw before approve', async function () {
    await escrow.withdraw.sendTransaction({from:customer}).should.be.rejected;
    await escrow.withdraw.sendTransaction({from:supplier}).should.be.rejected;
    await escrow.withdraw.sendTransaction({from:arbiter}).should.be.rejected;
  });

  it('nobody can approve before money is claimed', async function () {
    await escrow.approve.sendTransaction({from:customer}).should.be.rejected;
    await escrow.approve.sendTransaction({from:supplier}).should.be.rejected;
    await escrow.approve.sendTransaction({from:arbiter}).should.be.rejected;
  });


  it('arbiter cannot claim', async function () {
    await escrow.claim.sendTransaction({from:arbiter}).should.be.rejected;
  });  

  it('customer or supplier can claim and become claimer', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(customer);

    escrow2 = await Escrow.new(customer,supplier,arbiter);

    await escrow2.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow2.claimer.call()).should.be.equal(supplier);

  });

  it('unclaimed escrow can be CLAIMED', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.CLAIMED.call()).should.be.equal(true);
 
  });

 it('funds cannot be claimed more than once', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.CLAIMED.call()).should.be.equal(true);
    await escrow.claim.sendTransaction({from:supplier}).should.be.rejected;
 
  });  

  it('customer can approve claim of supplier', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(supplier);    
    await escrow.approve.sendTransaction({from:customer}).should.be.fulfilled; 
    (await escrow.APPROVED.call()).should.be.equal(true);
  });

   it('customer can reject claim of supplier', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(supplier);    
    await escrow.reject.sendTransaction({from:customer}).should.be.fulfilled; 
    (await escrow.ESCALATED.call()).should.be.equal(true);
  }); 

  it('supplier can approve claim of customer', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(customer);    
    await escrow.approve.sendTransaction({from:supplier}).should.be.fulfilled; 
    (await escrow.APPROVED.call()).should.be.equal(true);
  });

  it('supplier can reject claim of customer', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(customer);    
    await escrow.reject.sendTransaction({from:supplier}).should.be.fulfilled; 
    (await escrow.ESCALATED.call()).should.be.equal(true);
  });

  it('supplier cannot approve his own claim', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(supplier);    
    await escrow.approve.sendTransaction({from:supplier}).should.be.rejected; 
  });

  it('customer cannot approve his own claim', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(customer);    
    await escrow.approve.sendTransaction({from:customer}).should.be.rejected; 
  });


  it('arbiter cannot approve supplier or customer claim', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(supplier);    
    await escrow.approve.sendTransaction({from:arbiter}).should.be.rejected; 
  });



  it('unclaimed escrow cannot be approved', async function () {
    await escrow.approve.sendTransaction({from:supplier}).should.be.rejected;
    await escrow.approve.sendTransaction({from:arbiter}).should.be.rejected; 
    await escrow.approve.sendTransaction({from:customer}).should.be.rejected; 

  });

  it('claimed yet unapproved escrow cannot be withdrawn', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.withdraw.sendTransaction({from:supplier}).should.be.rejected;
  });

  it('approved escrow can be withdrawn', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.approve.sendTransaction({from:customer}).should.be.fulfilled;
    balBefore = await web3.eth.getBalance(escrow.address);
    await escrow.withdraw.sendTransaction({from:supplier}).should.be.fulfilled;
    balAfter = await web3.eth.getBalance(escrow.address);
  });

  it('approved escrow can be withdrawn by claimer only', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.approve.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.withdraw.sendTransaction({from:customer}).should.be.rejected;
  });

  it('escalated escrow can be settled by arbiter only', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.reject.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.settle.sendTransaction(50,{from:customer}).should.be.rejected;
    await escrow.settle.sendTransaction(50,{from:supplier}).should.be.rejected;
    await escrow.settle.sendTransaction(50,{from:arbiter}).should.be.fulfilled;
  });

  it('settled escrow show quotas for claimer and opponent', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.reject.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.settle.sendTransaction(40,{from:arbiter}).should.be.fulfilled;
    (await escrow.claimerQuota.call()).should.be.equal(40);
    (await escrow.opponentQuota.call()).should.be.equal(60);
  });




});