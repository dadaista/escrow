
pragma solidity 0.5.12;
contract Escrow{
    address arbiter;
    address payable customer;
    address payable supplier;
    uint8 public UNCLAIMED = 10;
    uint8 public PAY_CLAIMED = 20;
    uint8 public REFUND_CLAIMED = 25;
    uint8 public PAY_CLAIM_APPROVED = 30;
    uint8 public REFUND_CLAIM_APPROVED = 35;
    uint8 public ESCALATED  = 40;
    uint8 public SETTLED    = 50;
    uint8 public PAID       = 60;
    uint8 public state      = UNCLAIMED;
    address payable public claimer;
    address payable public opponent;
    uint8 public claimerQuota;
    uint8 public opponentQuota;
    

    event PaymentDone(uint256 amount, address recipient);
    event StateChange(uint8 oldState, uint8 newState);

    constructor(address payable _customer, 
                address payable _supplier,
                address payable _arbiter) public{

        customer = _customer;
        supplier = _supplier;
        arbiter  = _arbiter;
    }

    function () external payable{}

    function claim() external{
        require(state == UNCLAIMED);
        require(msg.sender == customer || msg.sender == supplier);
        claimer = msg.sender;
        
        if(claimer == customer) opponent=supplier;
        else opponent = customer;
        
        state = CLAIMED;
        emit StateChange(UNCLAIMED, CLAIMED);
    }
    
    function reject() external{
        require(state == CLAIMED);
        require(msg.sender == opponent);
        state = ESCALATED;
        emit StateChange (CLAIMED, ESCALATED);
    }    
    
    function approve() external{
        require(state == CLAIMED);
        require(msg.sender == opponent);
        claimerQuota = 100;
        opponentQuota = 0;
        state = APPROVED;
        emit StateChange(CLAIMED, APPROVED);
    }

    function settle(uint8 quota) external{
        require(state == ESCALATED);
        require(msg.sender == arbiter);
        claimerQuota = quota;
        opponentQuota = 100 - quota;
        state = SETTLED;
        emit StateChange(ESCALATED, SETTLED);
    }

    
    function withdraw() external{
        require (state == APPROVED || state == SETTLED);
        
        if(state == APPROVED) emit StateChange(APPROVED, PAID);
        if(state == SETTLED) emit StateChange(SETTLED, PAID);
        state = PAID;

        uint256 balance = address(this).balance;
        uint256 amount = (balance/100) * claimerQuota;

        if(amount>0){
            claimer.transfer(amount);
            emit PaymentDone(amount , claimer);
        }

        amount = (balance/100) * opponentQuota;

        if(amount>0){
            opponent.transfer(amount);
            emit PaymentDone(amount , opponent);
        }
    }
    

    
    
    
    
}
