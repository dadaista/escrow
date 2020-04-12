const Escrow = artifacts.require("Escrow");

var BN = web3.utils.BN;

const chai = require('chai');

const should = chai
  .use(require('chai-as-promised'))
  .should();

var state = {};
state.UNCLAIMED = 10;
state.PAY_CLAIMED = 20;
state.REFUND_CLAIMED = 25;
state.PAY_CLAIM_APPROVED = 30;
state.REFUND_CLAIM_APPROVED = 35;
state.ESCALATED = 40;
state.SETTLED = 50;
state.PAID = 60;

const ether = new BN(10).pow(new BN(18));

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


  it('unclaimed escrow can be CLAIMED by customer as refund', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.state.call()).toString().should.be.equal(String(state.REFUND_CLAIMED));
 
  });

  it('unclaimed escrow can be CLAIMED by supplier as pay', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow.state.call()).toString().should.be.equal(String(state.PAY_CLAIMED));
 
  });  

 it('funds claimed by customer cannot be claimed by supplier', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.claim.sendTransaction({from:supplier}).should.be.rejected;
 
  });  

 it('funds claimed by supplier cannot be claimed by customer', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.claim.sendTransaction({from:customer}).should.be.rejected;
 
  });  



  it('customer can approve PAY CLAIMED', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.approve.sendTransaction({from:customer}).should.be.fulfilled; 
    (await escrow.state.call()).toString().should.be.equal(String(state.PAY_CLAIM_APPROVED));
  });

  it('supplier can approve REFUND', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.approve.sendTransaction({from:supplier}).should.be.fulfilled; 
    (await escrow.state.call()).toString().should.be.equal(String(state.REFUND_CLAIM_APPROVED));
  });

   it('customer can reject claim of supplier', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.reject.sendTransaction({from:customer}).should.be.fulfilled; 
    (await escrow.state.call()).toString().should.be.equal(String(state.ESCALATED));
  }); 

   it('supplier can reject refund claim of customer', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.reject.sendTransaction({from:supplier}).should.be.fulfilled; 
    (await escrow.state.call()).toString().should.be.equal(String(state.ESCALATED));
  }); 


  it('supplier cannot approve his own claim', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.approve.sendTransaction({from:supplier}).should.be.rejected; 
  });

  it('customer cannot approve his own claim', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.approve.sendTransaction({from:customer}).should.be.rejected; 
  });


  it('arbiter cannot approve supplier claim', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.approve.sendTransaction({from:arbiter}).should.be.rejected; 
  });

  it('arbiter cannot approve customer claim', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
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


  it('escalated escrow can be settled by arbiter only', async function () {
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.reject.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.settle.sendTransaction(50,{from:customer}).should.be.rejected;
    await escrow.settle.sendTransaction(50,{from:supplier}).should.be.rejected;
    await escrow.settle.sendTransaction(50,{from:arbiter}).should.be.fulfilled;
  });

  it('settled escrow pays quotas for claimer and opponent', async function () {
    await escrow.sendTransaction({from:customer,value: ether});

    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    await escrow.reject.sendTransaction({from:customer}).should.be.fulfilled;
    await escrow.settle.sendTransaction(new BN(0.4).mul(ether),{from:arbiter}).should.be.fulfilled;
  
    let ticket = await escrow.withdraw.sendTransaction({from:supplier});
    
    console.log(ticket);

  });



});