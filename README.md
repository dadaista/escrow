# escrow
Simple solidity escrow

This escrow is based on 3 roles:
supplier, customer and arbiter

The customer can create the escrow with funds inside then it goes into the state UNCLAIMED.
For an UNCLAIMED escrow the supplier can request the payment (or the customer can request a refund)

The customer can approve the payment (or the supplier can approve the refund)

If the request for payment (or for refund) is declined by the customer (or by the supplier) then the contract is ESCALATED to the arbiter.

The arbiter can decide (settle) how much of the fund goes to pay the supplier and how much goes to refund the customer.

A settled fund can be liquidated with withdraw() by the party eligible to pull money out

# state diagram



UNCLAIMED -- claim by supplier--> PAY_CLAIMED
UNCLAIMED -- claim by customer--> REFUND_CLAIMED
PAY_CLAIMED -- reject --> ESCALATED
REFUND_CLAIMED -- reject --> ESCALATED
PAY_CLAIMED -- accept by customer --> PAY_CLAIM_ACCEPTED
REFUND_CLAIMED -- accept by supplier --> REFUND_CLAIM_ACCEPTED
ESCALATED -- settle by arbiter --> SETTLED
PAY_CLAIM_ACCEPTED -- withdraw --> PAID
REFUND_CLAIM_ACCEPTED -- withdraw --> PAID
SETTLED -- withdraw --> PAID




# License
Licensed under MIT License


