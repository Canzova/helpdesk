# Helpdesk Ticket Resolution Playbook

## 1. Standard Resolution Flow

Every support interaction should follow this sequence:

1. **Greet & Acknowledge** — Welcome the customer; acknowledge their issue with empathy
2. **Identify & Classify** — Determine the issue type: delivery, payment, return, refund, account, product, coupon, cancellation
3. **Authenticate** — Verify the customer's identity before accessing account-specific data
4. **Gather Facts** — Ask only the questions needed; don't over-question
5. **Verify** — Check relevant backend data (order status, payment record, ticket, etc.)
6. **Apply Policy** — Match the situation to the documented policy and give a direct answer
7. **Act** — Execute the supported action (create ticket, initiate return, etc.) only after confirmation
8. **Confirm** — Report actions only after the backend confirms success
9. **Escalate** — Route to the right team if the issue can't be resolved in-chat
10. **Summarize** — Tell the customer: what was done, what's pending, and what they can expect next

---

## 2. Scenario Playbooks

### 2.1 Payment Deducted — No Order Created

**Priority:** HIGH (involves money)

**Verify:**
- Does an order exist for the payment reference?
- What is the payment status: pending, failed, or captured?
- Is there a reconciliation record?

**Resolution:**
- If payment is pending: "Your payment is still processing. This usually resolves in a few hours — please check back. If no order appears after 24 hours, contact us with the transaction ID."
- If payment captured, no order: Escalate as a payment reconciliation case. Tell the customer: "We've identified a payment without a matching order. Our team will investigate and either create your order or initiate a refund within 2–3 business days."

**Never:** Tell the customer to pay again without confirming the original payment failed.

---

### 2.2 Delayed Delivery

**Verify:**
- Order status and last tracking update
- Expected delivery estimate
- Whether the shipment is stalled, returned, or lost

**Resolution:**
- If still in transit and within estimate: "Your order is on its way — the current estimate is [date]. Here's the latest tracking update: [status]."
- If estimate passed, tracking stalled: "I can see your order was expected by [date] but tracking hasn't updated. I'm escalating this to our logistics team who will investigate within 24–48 hours."
- If shipment is marked RTO (returned to origin): "Your delivery was unsuccessful and the item is on its way back to us. We'll initiate a refund or reattempt delivery once it reaches our warehouse — which of these would you prefer?"

**Never:** Invent a new delivery date. Don't promise compensation without authorization.

---

### 2.3 Order Marked "Delivered" — Not Received

**Priority:** HIGH

**Verify:**
- Backend delivery status
- Proof of delivery or delivery notes (if available)
- Any carrier delivery photograph

**Resolution:**
1. Ask: "Could you check with family members at the address, or at a security desk / neighbor's door?"
2. If genuinely not received: "I completely understand your concern. Delivery records show it as delivered, but I'm not dismissing that — let me raise this with our logistics investigation team immediately."
3. Create HIGH priority ticket: Shipping category, note: "Customer reports non-receipt despite delivered status."
4. "Our team will contact you within 24–48 hours with an update."

**Never:** Say "the system shows delivered so it must have arrived" — this dismisses legitimate complaints.

---

### 2.4 Wrong or Damaged Product Received

**Priority:** HIGH

**Verify:**
- Order and item details
- Customer's description of the issue
- Whether within 7-day return window

**Resolution:**
- Within 7 days: Initiate return/replacement immediately. Ask: "Would you prefer a replacement or a full refund?"
- After 7 days: Check warranty applicability. If defective, escalate.
- Collect photos for the record (if the system supports evidence uploads).

**Script:** "I'm so sorry you received [wrong/damaged item] — that's completely unacceptable and we'll fix this right away. I'm initiating a return pickup for you. Our team will pick it up within 2–5 business days. Do you prefer a replacement or a refund?"

---

### 2.5 Return Requested After 7 Days

**Verify:**
- Exact delivery date
- Date of customer's return request
- Whether it's a defect claim (may qualify under warranty even after 7 days)

**Resolution:**
- 1–2 days over: "I understand it's just slightly past our standard 7-day window. Let me see if I can raise an exception request given the circumstances."
- Defect claim after 7 days: "Since the product developed a defect, this may qualify under the manufacturer's warranty rather than our standard return policy. Let me check the applicable process for you."
- No exception path: Escalate to supervisor — don't flatly reject without human review.

---

### 2.6 Refund Not Received

**Verify:**
- Return/cancellation status
- Refund record — was it initiated?
- Refund status: initiated / processing / completed
- How many business days have passed since initiation

**Resolution:**
- Refund initiated recently (within 3–5 days): "Your refund is currently being processed. Based on our timeline, it should reach you by [estimated date]. Your bank may take 1–3 additional days to reflect it."
- Refund past 10 business days with no credit: "I can see the refund was initiated on [date] but it's been longer than expected. I'm escalating this for an urgent review — you should hear back within 24 hours."

**Never:** Say a refund has been initiated when no refund record exists in the backend.

---

### 2.7 Coupon Not Working

**Verify:**
- Coupon validity and terms
- Cart contents vs. coupon eligibility
- System rejection reason (if available in backend)

**Resolution:**
- Identify the specific reason from the checklist (see doc 06).
- Give the customer the exact reason, not a vague "it's not working."
- If terms are valid but system rejected it: "This looks like it should have worked. Let me escalate this for a technical review."

---

### 2.8 Suspected Counterfeit Product

**Priority:** URGENT

1. Do not confirm or deny the claim.
2. Say: "Thank you for reporting this — we take product authenticity extremely seriously."
3. Ask for: Order ID, product name, and what specifically seems suspicious.
4. Advise: "Please stop using the product for now and don't dispose of it or the packaging."
5. Create an URGENT ticket → route to Trust & Safety team.
6. "Our investigation team will reach out to you within 48 hours."

---

### 2.9 Warranty Claim

**Verify:**
- Product warranty terms (listing + warranty card)
- Purchase/delivery date
- Reported defect
- Whether within warranty period

**Resolution:**
- In-warranty: Guide customer to the correct claim process (manufacturer service center or EasyBuy-facilitated claim).
- Out of warranty: Explain clearly with empathy. Offer no-warranty repair options if known.
- Unclear terms: Escalate to product support team.

---

### 2.10 Address Change Request

**Verify:**
- Order status (is it dispatched yet?)
- Whether the backend supports address changes
- Customer authorization

**Resolution:**
- Before dispatch: Check system → process if supported → confirm only after backend success.
- After dispatch: "I'm sorry, but once an order is dispatched, the delivery address can't be updated. The best option at this point is to try contacting the carrier directly using the tracking number to arrange an alternate delivery."

---

## 3. Ticket Fields Reference

When creating a support ticket, include:

| Field | Description |
|---|---|
| Email | Customer's registered email (required) |
| Issue Summary | Clear, brief description of the problem |
| Priority | LOW / MEDIUM / HIGH (see guidelines below) |
| Category | Billing, Shipping, Returns, Account, Technical, Other |
| Contact Number | Customer's phone number |
| Order ID | If issue is order-related |
| Status | Always OPEN on creation |

**Priority Guidelines:**
- **LOW**: General inquiry, minor inconvenience, no money involved
- **MEDIUM**: Order delayed, coupon not working, return question
- **HIGH**: Payment issue, wrong/damaged product, account security, non-receipt of delivered order

---

## 4. Escalation Rules

Escalate immediately when:
- Money is potentially lost (unauthorized charges, missing refund, payment without order)
- A security or account compromise is suspected
- A product authenticity concern is raised
- The customer reports non-receipt of a "delivered" order
- The issue has been reported before and remains unresolved
- A required action is not supported by the current system
- Backend records are conflicting or unavailable

**Escalation script:** "I'm going to escalate this to our specialist team — they have the access and authority to resolve this for you. You'll receive an update within [timeframe] at your registered [email/phone]."

---

## 5. What a Good Response Looks Like

Every substantive response should:
1. **Acknowledge** the issue with empathy
2. **State** what was verified (from backend/policy)
3. **Explain** the applicable policy or next step
4. **Confirm** any action taken
5. **Set expectations** (timeline, next contact)
6. **Offer** further help

Keep it concise. Customers want solutions, not paragraphs.
