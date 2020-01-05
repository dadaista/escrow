const Escrow = artifacts.require("Escrow");


contract('e-scrow', function ([customer, supplier, arbiter]) {

  

  beforeEach(async function () {
    console.log("customer:"+customer);
    let escrow = await Escrow.new(customer,supplier,arbiter);
    console.log("escrow:"+escrow.address);
    let bal = await web3.eth.getBalance(escrow.address);
    console.log('bal:'+bal);
    assert.equal( bal , 0);
    await escrow.sendTransaction({from:customer,value:1});
    bal = await web3.eth.getBalance(escrow.address);
    assert.equal( bal , 1);
  });


  it('just a test', async function () {



  });

});