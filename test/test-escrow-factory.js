const EscrowFactory = artifacts.require("EscrowFactory");

const chai = require('chai');

const should = chai
  .use(require('chai-as-promised'))
  .should();

contract('e-scrow-factory', function ([customer, supplier, arbiter]) {

  var factory;
  

  beforeEach(async function () {
    console.log("customer:"+customer);
    factory = await EscrowFactory.new();
    console.log("factory:"+factory.address);
  });


  it('test sending create transaction ', async function () {
  	await factory.createEscrow
  		.sendTransaction(customer, supplier, arbiter,{from:customer})
  		.should.be.fulfilled;
  });

  it('test create and lock funds transaction ', async function () {
  	let ticket = await factory.createEscrow
  		.sendTransaction(customer, supplier, arbiter,{from:customer, value:1000})
  		.should.be.fulfilled;

//console.log(ticket.logs);
  	let escrowAddress = ticket.logs[0].args.escrow;
  	console.log(escrowAddress);
  	let bal = await web3.eth.getBalance(escrowAddress);
  	console.log(bal);
  	assert.equal(bal,1000);

  });

});