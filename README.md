PAYLOCK — AI-Powered Payment Verification and Fraud Prevention
“No verified payment. No released order.”

PAYLOCK helps online businesses determine whether a customer’s claimed payment is supported by reliable transaction evidence before the business releases an order, product, or service.
1. The problem PAYLOCK solves
In Ethiopian digital commerce, a customer may send a screenshot claiming they have paid through a digital payment service. But the screenshot alone does not prove that the money was actually transferred and received.

A receipt may be:
- Edited or fabricated.
- Reused for multiple orders.
- Associated with a different amount or recipient.
- From a transaction that is pending, failed, or not found.
- Genuine-looking but impossible to verify because the payment provider is temporarily unavailable.
Manually checking every payment takes time and creates opportunities for fraud.
2. How PAYLOCK works

1. A customer claims to have paid

The merchant receives a payment receipt or transaction reference.

2. PAYLOCK analyzes the payment evidence

Computer vision and OCR extract relevant details such as the transaction reference, amount, date, and recipient where available.

3. PAYLOCK checks the evidence

It checks transaction details against an authoritative payment source when supported, and looks for inconsistencies and duplicate receipts.

4. PAYLOCK returns a clear result

The merchant receives a status and explanation to help decide whether to release the order, investigate further, or wait.



3. How people use PAYLOCK

For merchants — the PAYLOCK website

A merchant creates an account, provides business information, uploads a customer's receipt, and receives the verification result through a dashboard. They can review previous checks and investigate suspicious cases.


For developers — PAYLOCK API

A developer integrates PAYLOCK into an existing ecommerce website. Their system submits payment evidence or transaction details to PAYLOCK and receives a verification result, allowing the merchant's order workflow to respond automatically.


Both experiences use the same verification engine. The difference is how the merchant accesses it: through PAYLOCK's dashboard or through an integration in their own website.
4. The core features of the idea
- Receipt data extraction: Read payment details from screenshots using OCR and computer vision.
- Transaction verification: Compare extracted details with an authoritative provider source when access is available.
- Fraud indicators: Detect altered-looking information, mismatched amounts or recipients, and suspicious reuse of receipts.
- Duplicate detection: Identify when the same receipt or transaction evidence is submitted repeatedly.
- Clear verification outcomes: Distinguish confirmed payments from mismatches, missing transactions, pending payments, and inconclusive checks.
- Merchant dashboard: Upload receipts, view results, and review transaction history.
- Developer API: Allow external ecommerce systems to request verification programmatically.
- Order workflow integration: Let a merchant's system release an order only when its required verification conditions are met.
5. The most important principle
PAYLOCK must not claim that AI can prove a payment happened just by looking at a screenshot.

AI can extract information and detect suspicious patterns, but confirmation that money was transferred requires reliable evidence from the payment provider or another authoritative source. If that source is unavailable, PAYLOCK should return an inconclusive or pending result rather than falsely label the customer a fraudster.

That distinction is central to making PAYLOCK trustworthy.
