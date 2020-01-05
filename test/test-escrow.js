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
    await escrow.claim.sendTransaction({from:supplier}).should.be.fulfilled;
    (await escrow.claimer.call()).should.be.equal(supplier);
  });

  it('if claimed escrow become CLAIMED', async function () {
    await escrow.claim.sendTransaction({from:customer}).should.be.fulfilled;
    (await escrow.CLAIMED.call()).should.be.equal(true);
 
  });

  it('arbiter cannot claim money', async function () {
    await escrow.claim.sendTransaction({from:arbiter}).should.be.rejected; 
  });


});