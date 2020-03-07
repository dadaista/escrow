pragma solidity 0.5.12;

import "./escrow.sol";

contract EscrowFactory{


	function createEscrow(address payable customer,
						  address payable supplier,
						  address payable arbiter) public{

		new Escrow(customer,supplier,arbiter);	
	}
	
}