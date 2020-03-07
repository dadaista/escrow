const EscrowFactory = artifacts.require("EscrowFactory");

module.exports = function(deployer,network,accounts) {
  //change the address with the actual VALOR token address
  console.log("network:"+network);
  if(network == "ropsten"){
  	deployer.deploy(EscrowFactory);
  }
  	
};