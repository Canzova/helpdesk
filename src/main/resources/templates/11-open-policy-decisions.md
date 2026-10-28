# Open Policy Decisions

## Purpose

This document lists unresolved EasyBuy policy and operational decisions. It helps prevent the AI assistant from inventing rules that have not been approved.

These are internal planning notes for the demo and should not be presented to customers as confirmed policies.

## 1. Shipping and Delivery

Decisions needed:

- Does the 3–7 day estimate mean calendar days or business days?
- When does the delivery estimate begin?
- How are delivery estimates calculated by location or product category?
- What defines dispatch?
- Can delivery instructions or contact details be changed?
- What happens after a failed delivery attempt?
- How should stalled, lost, or returned shipments be handled?
- Are delivery fees refundable?
- Is compensation available for delayed deliveries?
- What escalation team and response-time target apply?

## 2. Returns and Replacements

Decisions needed:

- Does the seven-day window start at order placement, dispatch, delivery, or another event?
- Are the seven days calendar days or business days?
- Which exact products are non-returnable?
- What are the rules for opened beauty products and innerwear?
- What condition, tag, seal, packaging, and accessory requirements apply?
- Are used products eligible for any return reasons?
- What are the rules for missing parts, wrong products, and damaged products?
- Are late reports of damage handled differently?
- Who pays return shipping?
- Are pickups available, and are fees or attempt limits applicable?
- When is replacement preferred over refund?
- Who can approve exceptions?

## 3. Payments and Refunds

Decisions needed:

- What event starts the 3–5 business day refund estimate?
- Does the estimate vary by payment method?
- How are pending authorizations handled?
- What is the process for payment captured without an order?
- What is the process for duplicate successful payments?
- Which payment or refund reference can be shared with customers?
- What determines the refund destination?
- What happens when the standard estimate passes?
- What are the COD availability, fee, and limit rules?
- What are the payment reconciliation response-time targets?

## 4. Cancellation and Order Changes

Decisions needed:

- Which order statuses permit cancellation?
- Is there a cancellation cutoff?
- Are cancellation fees applicable?
- Can individual items be cancelled from a multi-item order?
- Can size, color, quantity, or product be changed after placement?
- What happens when cancellation is requested after dispatch?
- When is the refund initiated after cancellation?
- Who approves exceptions?

## 5. Warranty and Product Authenticity

Decisions needed:

- Which products have warranties?
- What duration and coverage apply to each product?
- Which exclusions apply?
- Who provides warranty service: seller, manufacturer, or another party?
- Which service centers or claim channels are supported?
- What is the warranty claim process and target response time?
- What evidence is required for suspected counterfeit products?
- Which team handles authenticity investigations?
- What information can customers receive during an investigation?

## 6. Coupons and Promotions

Decisions needed:

- Can coupons be combined?
- Are there usage limits per customer?
- Are specific products, categories, or sellers excluded?
- Can expired coupons be extended or reissued?
- Are retroactive price adjustments allowed?
- What happens when a discount is removed after checkout?
- Who can approve a promotional exception?

## 7. Support Operations

Decisions needed:

- Which support channels are official?
- What are support hours?
- Which queues handle payments, delivery, returns, security, and product issues?
- What response and resolution targets apply?
- Which ticket fields are mandatory?
- Can the AI create, update, assign, or close tickets?
- Can the AI initiate refunds, cancellations, or returns?
- What actions require human approval?
- Which compensation or goodwill options are authorized?

## 8. Security and Privacy

Decisions needed:

- Which authentication and authorization methods are required?
- Which customer fields can be accessed by the assistant?
- What conversation and ticket retention periods apply?
- How are deletion requests handled?
- What data can be sent to external AI providers?
- What redaction and logging controls are required?
- How are account-security incidents escalated?

## 9. Rule for the AI Assistant

Until a decision is approved and documented:

1. Do not invent the missing rule.
2. Do not present a possible practice as a confirmed policy.
3. Check an authorized backend or approved product-specific terms if available.
4. Explain the limitation in customer-friendly language.
5. Escalate when a decision is necessary to resolve the customer's issue.

## 10. Updating the Knowledge Base

When a policy is approved:

1. Update the relevant Markdown file.
2. Record its version and approval status.
3. Re-ingest or update the document in the vector store.
4. Verify that retrieval returns the updated version.
5. Test questions affected by the change.
6. Remove or supersede conflicting outdated content.

Do not treat a draft or mock policy as production-approved merely because it exists in the vector database.