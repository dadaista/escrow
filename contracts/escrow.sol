
pragma solidity 0.5.12;
contract Escrow{
    address arbiter;
    address payable customer;
    address payable supplier;
    bool public UNCLAIMED  = true;
    bool public CLAIMED    = false;
    bool public APPROVED   = false;
    bool public PAID       = false;
    address payable public claimer;
    
    
    constructor(address payable _customer, 
                address payable _supplier,
                address payable _arbiter) public{

        customer = _customer;
        supplier = _supplier;
        arbiter  = _arbiter;
    }

    function () external payable{}

    function claim() external{
        require(UNCLAIMED);
        require(msg.sender == customer || msg.sender == supplier);
        claimer = msg.sender;
        CLAIMED = true;
        UNCLAIMED = false;
    }
    
    
    function approve() external{
        require(CLAIMED);
        require(msg.sender != claimer);
        APPROVED = true;
        CLAIMED = false;
    }

    function rejectClaim() external{
        require(CLAIMED);
        require(msg.sender == arbiter);
        CLAIMED = false;
        UNCLAIMED = true;
    }
    
    function withdraw() external{
        require (APPROVED);
        require (msg.sender == claimer);
        claimer.transfer(address(this).balance);
        
    }
    

    
    
    
    
}
