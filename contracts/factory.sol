pragma solidity 0.5.12;

import "./escrow.sol";

contract EscrowFactory{
	event EscrowCreated(address a);

	function createEscrow(address payable customer,
						  address payable supplier,
						  address payable arbiter) public{

		Escrow e = new Escrow(customer,supplier,arbiter);
		emit EscrowCreated(address(e));	
	}
	
}