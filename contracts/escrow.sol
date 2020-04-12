
pragma solidity 0.5.12;
contract Escrow{
    address public arbiter;
    address payable public customer;
    address payable public supplier;
    uint8 public UNCLAIMED = 10;
    uint8 public PAY_CLAIMED = 20;
    uint8 public REFUND_CLAIMED = 25;
    uint8 public PAY_CLAIM_APPROVED = 30;
    uint8 public REFUND_CLAIM_APPROVED = 35;
    uint8 public ESCALATED = 40;
    uint8 public SETTLED = 50;
    uint8 public PAID = 60;
    uint8 public state = UNCLAIMED;
    uint256 public settlement;
    

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
        
        if(msg.sender == customer){
            state = REFUND_CLAIMED;
            emit StateChange(UNCLAIMED, REFUND_CLAIMED);
        } 
        else{
            state = PAY_CLAIMED;
            emit StateChange(UNCLAIMED, PAY_CLAIMED);            
        }
    }
    
    function reject() external{
        require(state == PAY_CLAIMED || state == REFUND_CLAIMED);
        if(state == PAY_CLAIMED) require(msg.sender == customer);
        if(state == REFUND_CLAIMED) require(msg.sender == supplier);

        uint8 oldState = state;
        state = ESCALATED;
        emit StateChange (oldState, state);
    }    
    
    function approve() external{
        require(state == PAY_CLAIMED || state == REFUND_CLAIMED);

        uint8 oldState = state;
        if(state == PAY_CLAIMED){
            require(msg.sender == customer);
            state = PAY_CLAIM_APPROVED;
        }

        if(state == REFUND_CLAIMED){
            require(msg.sender == supplier);
            state = REFUND_CLAIM_APPROVED;
        }
 
        emit StateChange(oldState, state);
    }

    function settle(uint256 _settlement) external{
        require(state == ESCALATED);
        require(msg.sender == arbiter);
        uint256 balance = address(this).balance;
        require (_settlement <= balance);

        settlement = _settlement;
        state = SETTLED;
        emit StateChange(ESCALATED, SETTLED);
    }

    
    function withdraw() external{
        require (state == PAY_CLAIM_APPROVED || state == REFUND_CLAIM_APPROVED || state == SETTLED);
        uint8 oldState = state;
        state = PAID;
        emit StateChange(oldState, state);

        uint256 balance = address(this).balance;

        if(oldState == PAY_CLAIM_APPROVED){
            supplier.transfer(balance);
            emit PaymentDone(balance , supplier);
        }

        if(oldState == REFUND_CLAIM_APPROVED){
            customer.transfer(balance);
            emit PaymentDone(balance , customer);
        }


        if(oldState == SETTLED){
            require(settlement <= balance);
            supplier.transfer(settlement);
            emit PaymentDone(settlement , supplier);
            customer.transfer(balance - settlement);
            emit PaymentDone(balance - settlement , customer);
            
        }

    }
    

    
    
    
    
}
