
pragma solidity 0.5.12;
contract Escrow{
    address arbiter;
    address payable customer;
    address payable supplier;
    bool public UNCLAIMED  = true;
    bool public CLAIMED    = false;
    bool public APPROVED   = false;
    bool public ESCALATED  = false;
    bool public SETTLED    = false;
    bool public PAID       = false;
    address payable public claimer;
    address payable public opponent;
    uint8 public claimerQuota;
    uint8 public opponentQuota;
    
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

        if(claimer == customer) opponent=supplier;
        else opponent = customer;

        CLAIMED = true;
        UNCLAIMED = false;
    }
    
    function reject() external{
        require(CLAIMED);
        require(msg.sender == opponent);
        ESCALATED = true;
        CLAIMED = false;

    }    
    
    function approve() external{
        require(CLAIMED);
        require(msg.sender == opponent);
        claimerQuota = 100;
        opponentQuota = 0;
        APPROVED = true;
        CLAIMED = false;
    }

    function settle(uint8 quota) external{
        require(ESCALATED);
        require(msg.sender == arbiter);
        claimerQuota = quota;
        opponentQuota = 100 - quota;
        ESCALATED = false;
        SETTLED = true;
    }

    
    function withdraw() external{
        require (APPROVED || SETTLED);
        if (APPROVED) APPROVED = false;
        if (SETTLED) SETTLED = false;
        PAID = true;

        uint256 balance = address(this).balance;
        claimer.transfer((balance/100) * claimerQuota);
        opponent.transfer((balance/100) * opponentQuota);
        
    }
    

    
    
    
    
}
