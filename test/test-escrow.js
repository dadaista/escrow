const Escrow = artifacts.require("Escrow");

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
    await escrow.sendTransaction({from:customer,value:1});
    bal = await web3.eth.getBalance(escrow.address);
    assert.equal( bal , 1);
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

  it('arbiter cannot claim', async function () {
    await escrow.claim.sendTransaction({from:arbiter}).should.be.rejected; 
  });

  it('customer can approve claim of supplier', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(supplier);    
    await escrow.approve.sendTransaction({from:customer}).should.be.fulfilled; 
    (await escrow.APPROVED.call()).should.be.equal(true);
  });

  it('supplier can approve claim of customer', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(customer);    
    await escrow.approve.sendTransaction({from:supplier}).should.be.fulfilled; 
    (await escrow.APPROVED.call()).should.be.equal(true);
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


  it('arbiter can approve supplier or customer claim', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(supplier);    
    await escrow.approve.sendTransaction({from:arbiter}).should.be.fulfilled; 
    (await escrow.APPROVED.call()).should.be.equal(true);
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
    await escrow.withdraw.sendTransaction({from:supplier}).should.be.fulfilled;
  });

  it('approved escrow can be withdrawn by claimer only', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.approve.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.withdraw.sendTransaction({from:customer}).should.be.rejected;
  });




});