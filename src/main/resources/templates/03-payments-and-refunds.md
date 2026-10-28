# Payments and Refunds

## 1. Refund Processing Estimate

The mock standard refund processing estimate is **3–5 business days**.

The policy does not define when this period starts, whether it begins at return approval or refund initiation, or how processing differs by payment method.

Always distinguish the estimated processing time from the actual status of a customer's refund.

## 2. Payment Deducted but No Order Appears

When a customer reports that money was deducted but no order appears:

1. Ask the customer to check the order history and any order confirmation.
2. Verify the order and payment records through authorized backend services.
3. If a confirmed payment exists without a corresponding order, follow the configured payment-reconciliation process.
4. If the payment is pending or its status is unclear, explain that the transaction needs verification.
5. Escalate when records are missing or inconsistent.

Do not tell the customer to pay again before checking whether the original transaction created an order.

Do not promise an automatic reversal or a specific reversal time unless an approved payment policy confirms it.

## 3. Payment Successful but Order Status Is Pending

Compare the payment record with the order record.

If the records disagree, do not assume either one is correct. Explain that the transaction needs reconciliation and escalate through the configured process.

## 4. Failed Payment

Check whether the payment failed and whether an order was created.

Explain only what the available records confirm. If the payment status is pending, do not describe it as definitively failed or successful.

## 5. Duplicate Debit

A customer may see multiple transaction entries, including pending authorizations or completed debits.

Verify the transaction records before classifying the situation as a duplicate successful payment.

If multiple captured payments are confirmed for one order, follow the configured reconciliation and refund process. Do not promise a refund before the relevant record is confirmed.

## 6. Refund Status

When a customer asks about a refund:

1. Verify the relevant order or claim.
2. Check the return, cancellation, or other underlying request.
3. Retrieve the refund record and its current status.
4. Explain the status and the general processing estimate.
5. Escalate if the estimate has passed or the necessary status is unavailable.

If no refund record exists, do not claim that a refund has been initiated.

Do not fabricate transaction references or refund confirmation numbers.

## 7. Refund Destination

The refund destination and exact handling rules for each payment method have not been defined in this mock policy.

Use the confirmed payment/refund record or an approved payment-method policy. Do not promise a destination or settlement date without supporting information.

## 8. Cash on Delivery (COD)

COD limits, fees, availability, and collection rules have not been defined.

If a customer reports that cash was collected but the order record shows an unpaid status, verify the delivery and payment records and escalate the discrepancy.

Do not assume the customer is mistaken or claim that the payment record has been corrected without confirmation.

## 9. Information to Protect

Never ask for:

- UPI PINs.
- OTPs.
- Passwords.
- CVVs.
- Full payment-card numbers.
- Banking credentials or authentication tokens.

Use approved transaction identifiers and secure workflows instead.

## 10. Escalation Conditions

Escalate when:

- Money appears to have been deducted without an order.
- Payment and order records conflict.
- Multiple successful debits are suspected.
- A refund is past its verified processing estimate.
- A transaction cannot be located.
- COD collection and payment records disagree.
- The refund destination or payment rules are unclear.

## 11. Unspecified Details

The mock policy does not define:

- When the refund processing estimate starts.
- Automatic reversal timelines.
- Payment-method-specific settlement timelines.
- Pending authorization expiry.
- Duplicate-payment resolution timelines.
- COD fees and limits.
- Payment reconciliation service-level agreements.