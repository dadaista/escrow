
pragma solidity 0.5;
contract Escrow{
    address arbiter;
    address customer;
    address supplier;
    bool UNCLAIMED  = true;
    bool CLAIMED    = false;
    bool APPROVED   = false;
    bool PAID       = false;
    address claimer;
    
    
    function claim(){
        require(UNCLAIMED);
        claimer = msg.sender;
        CLAIMED = true;
    }
    
    
    function approve(){
        require(CLAIMED);
        require(msg.sender != claimer);
        APPROVED = true;
    }
    
    function withdraw(){
        require (APPROVED);
        require (msg.sender == claimer);
        claimer.send()
        
    }
    

    
    
    
    
}
