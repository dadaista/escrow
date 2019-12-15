
pragma solidity 0.5;
contract Escrow{
    address arbiter;
    address payable customer;
    address payable supplier;
    bool UNCLAIMED  = true;
    bool CLAIMED    = false;
    bool APPROVED   = false;
    bool PAID       = false;
    address payable claimer;
    
    
    constructor(address payable _customer, 
                address payable _supplier,
                address payable _arbiter) public{

        customer = _customer;
        supplier = _supplier;
        arbiter  = _arbiter;
    }

    function claim() external{
        require(UNCLAIMED);
        claimer = msg.sender;
        CLAIMED = true;
    }
    
    
    function approve() external{
        require(CLAIMED);
        require(msg.sender != claimer);
        APPROVED = true;
    }
    
    function withdraw() external{
        require (APPROVED);
        require (msg.sender == claimer);
        claimer.transfer(address(this).balance);
        
    }
    

    
    
    
    
}
