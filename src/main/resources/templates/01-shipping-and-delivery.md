# Shipping and Delivery Policy

## 1. Standard Delivery Estimate

EasyBuy's mock standard delivery estimate is **3–7 days**.

This is an estimate, not a guaranteed delivery date. The documentation does not specify whether this means calendar days or business days.

If an authenticated order service provides an order-specific delivery estimate, use that information instead of assuming the general estimate applies exactly.

## 2. Tracking an Order

When a customer asks where an order is:

1. Ask for the minimum order reference needed by the application.
2. Authenticate the customer and verify authorization to access the order.
3. Retrieve the current status and tracking details from the backend.
4. Explain the verified status and any available carrier information.
5. If tracking information is unavailable or inconsistent, recommend support review.

Never invent tracking numbers, locations, carrier updates, or delivery dates.

## 3. Order Has Not Arrived

If the expected delivery estimate has passed:

1. Verify the order and its latest delivery estimate.
2. Check the latest shipment and tracking status.
3. Explain the available facts.
4. Escalate if the shipment is stalled, overdue, returned, or missing.

Do not promise a new arrival date, compensation, or a guaranteed resolution time unless an approved system or policy explicitly confirms it.

## 4. Order Marked as Delivered but Not Received

Ask the customer to check any available delivery instructions or proof of delivery, if the system provides them.

Then:

1. Verify that the order is marked delivered.
2. Review available delivery evidence.
3. Follow the configured missing-delivery investigation process.
4. Escalate if the issue remains unresolved.

Do not assume that the customer received the parcel merely because the status says delivered.

## 5. Changing the Delivery Address

Address changes may be considered **before dispatch**, subject to verification and system availability.

The assistant must:

1. Verify the order and customer authorization.
2. Check the current dispatch status.
3. Use the approved address-change workflow if one exists.
4. Report success only after the backend confirms the change.

If the order has already been dispatched, do not promise that the address can be changed. Explain that the available options must be checked through the configured support process.

## 6. Delivery Instructions

Rules for changing delivery instructions, phone numbers, or other shipment details have not been defined.

Check the available system workflow or escalate rather than assuming these changes are supported.

## 7. Failed Delivery Attempt

If a delivery attempt fails, check the carrier or shipment record for the recorded reason and any available next steps.

Do not promise redelivery, a specific attempt count, or a particular carrier action unless verified.

## 8. Escalation Conditions

Escalate when:

- The expected delivery estimate has passed.
- Tracking has stalled or contains conflicting information.
- An order is marked delivered but the customer reports non-receipt.
- The shipment appears lost or returned.
- An address-change request cannot be verified.
- The policy or backend does not provide enough information.

## 9. Unspecified Details

The following are not defined in this mock policy:

- Calendar days versus business days.
- How the delivery estimate is calculated.
- Delivery estimates by location or product category.
- Dispatch cutoffs and warehouse processing times.
- Redelivery attempts and fees.
- Delivery compensation.
- Exact escalation channels and response-time commitments.