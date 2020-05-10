const EscrowFactory = artifacts.require("EscrowFactory");

module.exports = function(deployer,network,accounts) {
  console.log("network:"+network);
  if(network == "ropsten"){
  	deployer.deploy(EscrowFactory);
  }
  	
};