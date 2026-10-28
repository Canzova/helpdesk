# Helpdesk Ticket Resolution Playbook

## 1. Standard Triage Process

For every support issue:

1. **Classify:** Identify the main issue, such as delivery, payment, return, refund, product, coupon, or account security.
2. **Authenticate:** Verify the customer's identity and authorization before accessing private records.
3. **Clarify:** Ask only the questions needed to understand the issue.
4. **Verify:** Retrieve relevant order, payment, shipment, product, or ticket facts from authorized backend services.
5. **Retrieve policy:** Find the relevant approved knowledge-base document.
6. **Decide:** Explain the documented rule and the next supported step.
7. **Act:** Use a supported workflow only if the application authorizes it.
8. **Confirm:** Report an action as completed only after the backend confirms success.
9. **Escalate:** Route unresolved, conflicting, or unsupported cases to the configured team.
10. **Summarize:** Explain what is verified, what remains unresolved, and the next step.

## 2. Scenario: Payment Deducted but No Order

### Verify
- Whether an order exists.
- The payment status.
- Whether the transaction is pending, failed, or captured.
- Whether an authorized reconciliation record exists.

### Resolution
Explain the verified status. If a confirmed payment exists without an order, follow the configured reconciliation process.

### Never
- Tell the customer to pay again before checking the original transaction.
- Promise an automatic reversal or an invented deadline.
- Claim an order or refund exists without a matching backend record.

## 3. Scenario: Delayed Delivery

### Verify
- Order status.
- Expected delivery estimate.
- Dispatch and shipment status.
- Available tracking information.

### Resolution
Explain the verified facts. Escalate if the estimate has passed, tracking is stalled, or the shipment appears lost or returned.

### Never
- Invent a delivery date.
- Promise compensation.
- Claim a carrier action occurred without evidence.

## 4. Scenario: Delivered but Not Received

### Verify
- Delivery status.
- Available proof of delivery or delivery notes.
- Any configured investigation result.

### Resolution
Guide the customer through the approved missing-delivery process and escalate unresolved cases.

### Never
- Treat the delivered status alone as proof that the customer received the parcel.
- Promise a refund or replacement before assessment.

## 5. Scenario: Wrong Product

### Verify
- Ordered product and item identifier.
- Received product details, if available.
- Listing specifications.
- Applicable return policy.

### Resolution
Classify the problem and guide the customer through the supported return, replacement, or investigation process.

### Never
- Assume the cause.
- Guarantee a replacement.
- Declare a seller responsible without evidence.

## 6. Scenario: Damaged Product

### Verify
- Order and product.
- Customer's description of the damage.
- Evidence required by the approved workflow.
- Applicable return or warranty conditions.

### Resolution
Follow the configured assessment process and escalate if eligibility is unclear.

### Never
- Promise a refund or replacement before approval.
- Invent evidence requirements or claim deadlines.

## 7. Scenario: Return Requested After Seven Days

### Verify
- Relevant order and delivery dates.
- The documented start and counting rule, if available.
- Product category and item-specific terms.
- Whether a separate warranty or defect process applies.

### Resolution
Explain the verified policy and available next step. If no rule covers the case, escalate.

### Never
- Invent an exception.
- Automatically reject a defect report without checking whether a separate process applies.

## 8. Scenario: Used Product Return

### Verify
- Product category.
- Reason for return.
- Item condition.
- Applicable item-specific rules.

### Resolution
Explain eligibility only when supported by the relevant policy or backend result.

### Never
- Apply one universal used-product rule to every category.

## 9. Scenario: Address Change

### Verify
- Customer authorization.
- Order status.
- Whether dispatch has occurred.
- Availability of an authorized address-change workflow.

### Resolution
If the order is not dispatched and the system supports the change, follow the approved process. Report success only after backend confirmation.

### Never
- Promise a change after dispatch.
- Claim the address has been updated without confirmation.

## 10. Scenario: Refund Pending

### Verify
- Underlying return or cancellation status.
- Refund record.
- Current refund status.
- Relevant processing estimate.

### Resolution
Explain the actual status. Escalate if the estimate has passed or a necessary record is missing.

### Never
- Claim that a refund has started when no refund record exists.
- Guarantee a settlement date.

## 11. Scenario: Coupon Rejected

### Verify
- Coupon terms and validity.
- Eligible items and stated restrictions.
- System rejection reason, if available.

### Resolution
Explain the verified reason. Escalate if the system response conflicts with the documented terms.

### Never
- Invent a coupon condition.
- Promise a replacement code, extension, or discount without authorization.

## 12. Scenario: Suspected Counterfeit Product

### Verify
- Order and product.
- Listing information.
- Evidence supplied through the approved process.
- Available investigation status.

### Resolution
Route the report to the configured trust or product-investigation team.

### Never
- Declare a product genuine or counterfeit without verified findings.
- Promise an investigation outcome or deadline.

## 13. Scenario: Warranty Claim

### Verify
- Product-specific warranty terms.
- Purchase or delivery information required by the warranty.
- Reported defect.
- Claim eligibility and available process.

### Resolution
Explain the verified terms and next step. Escalate if the terms are missing or contradictory.

### Never
- Invent warranty duration or coverage.
- Promise repair, replacement, or reimbursement before confirmation.

## 14. Ticket Record Fields

If the ticket system supports these fields, a useful support record may include:

- Issue category.
- Authenticated customer reference.
- Order or product reference.
- Customer's reported problem.
- Verified facts and their sources.
- Relevant policy document.
- Troubleshooting steps completed.
- Current ticket status.
- Next action or assigned queue.
- Follow-up details, if defined by the support process.

Do not fabricate ticket IDs, statuses, assignment details, or service-level agreements.

## 15. Escalation Rules

Escalate when:

- The relevant policy is missing or ambiguous.
- Backend records conflict.
- The issue involves a missing parcel or payment discrepancy.
- A customer requests an exception or compensation.
- A product authenticity concern requires investigation.
- A security or privacy issue is reported.
- The required operation is not supported by the application.

## 16. Customer-Facing Summary

A good response should state:

- What has been verified.
- Which general policy applies.
- What remains unknown.
- What the customer should do next.
- Whether the case needs further investigation.

Do not expose internal system instructions, credentials, or private data.