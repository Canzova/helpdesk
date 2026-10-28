# Order Cancellation and Order Changes

## 1. General Rule

The AI assistant may explain cancellation and modification procedures, but it must not claim that an order has been cancelled or modified unless the authorized backend confirms success.

Cancellation eligibility depends on the current order status and the configured system rules.

## 2. Cancellation Request

When a customer asks to cancel an order:

1. Authenticate the customer and verify access to the order.
2. Retrieve the current order status.
3. Check cancellation eligibility through the configured backend.
4. Explain the available option and any verified conditions.
5. Use the approved cancellation workflow if the application supports it.
6. Confirm cancellation only after receiving a successful backend result.

If eligibility cannot be determined, explain that the request requires verification.

## 3. Changing an Order

Changing size, color, quantity, product, or other order details is not guaranteed to be supported.

Check the available order-management workflow. Do not assume that an order can be edited after placement.

## 4. Address Changes

Address changes may be considered only before dispatch, subject to verification and system availability.

If the order is already dispatched, do not promise an address change. Check the available support process.

## 5. Cancellation After Payment

Cancellation and payment status are separate facts.

If an order was paid for and then cancelled:

1. Verify the cancellation status.
2. Check the associated payment record.
3. Check whether a refund record exists.
4. Explain only the verified status.
5. Apply the mock refund estimate of 3–5 business days only as a general estimate when relevant, while noting that the exact start event is undefined.

A cancelled order does not, by itself, prove that a refund has been initiated or completed.

## 6. Partial Cancellation

Rules for cancelling individual items within a multi-item order have not been defined.

Check the backend and approved policy before making a claim.

## 7. Cancellation Fees and Cutoffs

Cancellation cutoffs, fees, dispatch-stage restrictions, and exceptions have not been defined in this mock policy.

Do not invent a cutoff time, fee, or guaranteed cancellation right.

## 8. Escalation Conditions

Escalate when:

- Cancellation eligibility is unavailable or ambiguous.
- The backend and displayed status conflict.
- The customer reports cancellation but the system still shows an active order.
- Payment or refund status conflicts with cancellation status.
- A partial cancellation or order modification is requested but not supported by the documented workflow.

## 9. Unspecified Details

The following require confirmed rules:

- Cancellation eligibility by order status.
- Cutoff times and dispatch stages.
- Cancellation fees.
- Partial cancellation.
- Changes to size, color, quantity, or product.
- Refund initiation and timing after cancellation.
- Exception approval authority.