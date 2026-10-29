# Payments and Refunds

## 1. Refund Timeline

Standard refund processing: **3–5 business days** after the return is received and approved.

| Refund Trigger | When Refund Starts |
|---|---|
| Return pickup completed + inspected | Within 24–48 hours of inspection |
| Order cancelled before dispatch | Within 24 hours of cancellation confirmation |
| Failed delivery (returned to origin) | Within 2–3 business days of item reaching warehouse |
| Payment failure (amount deducted, no order) | Typically 3–7 business days — depends on bank |

**Refund destination** is typically the original payment method:
- UPI / Net Banking / Debit Card → Back to the same account
- Credit Card → Back to the credit card (may appear in the next billing cycle)
- Wallet → Refunded to EasyBuy wallet or original wallet
- COD → Refunded as EasyBuy wallet credit or bank transfer (customer's preference)

Always tell customers: "The refund has been initiated from our end. The time it takes to appear in your account depends on your bank — this is typically 1–3 business days after we process it."

## 2. Payment Deducted — No Order Appeared

This is a common issue with UPI and net banking. Handle it carefully:

1. Ask the customer: "When did you make the payment? Do you have a UPI transaction ID or bank reference number?"
2. Check the order system — if no order exists for that payment reference, it's likely a failed transaction.
3. Explain: "Sometimes when a payment is processing, the amount is temporarily held by your bank even if the order didn't go through. This is called a 'pending authorization.'"
4. **For UPI/Net Banking**: "If the transaction was deducted and no order was created, the amount is typically auto-reversed within 5–7 business days by your bank. If it hasn't returned after 7 days, please share the transaction ID and we'll raise a reconciliation request."
5. **Never tell the customer to pay again** without first confirming the original payment status.

If a confirmed payment exists with no matching order: escalate as a payment reconciliation case (HIGH priority).

## 3. Payment Successful but Order Is Still Pending

This can happen due to a delay between payment gateway confirmation and order system processing.

1. Ask the customer to wait 15–30 minutes and check again.
2. If the order is still not visible after 1 hour: verify the payment status in the backend.
3. If payment is confirmed but no order exists: escalate as a reconciliation case.
4. If payment status is "pending": "Your payment is still being processed by your bank. This usually resolves within a few hours. We'll notify you once the order is confirmed."

## 4. Duplicate Deduction / Double Charged

1. Ask the customer to share the transaction IDs for both charges.
2. Check the payment records in the backend — confirm whether two payments were captured for the same order.
3. If confirmed duplicate: "You've been charged twice by mistake. We'll initiate a refund for the extra payment within 2–3 business days." Then create a refund ticket (HIGH priority).
4. If one transaction is pending (authorization hold, not a capture): "The second charge appears to be a temporary authorization hold that will be released by your bank within 3–5 business days."

## 5. Refund Status Check

When a customer asks about their refund:

1. Look up the return/cancellation record and the associated refund record.
2. Share the current status: Initiated / Processing / Completed.
3. If refund is completed: "Your refund of ₹[amount] was processed on [date]. Please check your [UPI/bank account/card statement]."
4. If refund is still processing: "Your refund is in progress. Based on our standard timeline of 3–5 business days, you should see it by [estimated date]."
5. If the standard timeline has passed with no credit: escalate immediately.

## 6. Cash on Delivery (COD) Refunds

- COD refunds cannot go back as cash.
- Options: EasyBuy wallet credit (instant) or bank transfer (3–5 business days).
- Ask the customer: "Would you prefer the refund as EasyBuy wallet credit (instant) or a bank transfer (3–5 days)?"
- For bank transfer, collect: Account holder name, account number, IFSC code.

## 7. Refund for Cancelled Order

- If cancelled before dispatch: refund initiates within 24 hours of cancellation.
- If cancelled after dispatch but before delivery: refund initiates after the item is returned to the warehouse (typically 3–7 days).
- Tell the customer: "Once the cancellation is confirmed, the refund will be processed within [timeline] back to your original payment method."

## 8. What We Never Ask For

**Never request or accept from customers:**
- UPI PINs
- OTPs
- Account passwords
- CVVs or full card numbers
- Net banking passwords or session tokens

If a customer shares these accidentally: "For your security, please do not share these details. I'd recommend changing your PIN/password immediately."

## 9. Escalation Conditions

Escalate (create a ticket) when:
- Payment was deducted but no order exists and 7+ business days have passed
- Duplicate payment is confirmed in the backend
- Refund has not arrived after 10 business days
- COD collection and order system records disagree
- Customer disputes a charge that the backend shows as resolved

## 10. Quick Reference Answers

| Question | Answer |
|---|---|
| How long does a refund take? | 3–5 business days after the return is approved. |
| Money was deducted but no order? | Check after 30 min — usually auto-reversed in 5–7 business days by bank. Share transaction ID if it hasn't returned. |
| I was charged twice — what do I do? | Share both transaction IDs. We'll verify and refund the duplicate within 2–3 business days. |
| Can I get a COD refund to my bank? | Yes! Provide your bank account details and we'll process it within 3–5 business days. |
| Where will my refund go? | Back to the original payment method (UPI, card, wallet, etc.). |
