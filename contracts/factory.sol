pragma solidity 0.5.12;

import "./escrow.sol";

contract EscrowFactory{
	event EscrowCreated(address escrow, address createdBy);

	function createEscrow(address payable customer,
						  address payable supplier,
						  address payable arbiter) public payable{

		Escrow e = new Escrow(customer,supplier,arbiter);
		emit EscrowCreated(address(e),msg.sender);
		address(e).transfer(msg.value);	
	}	
}