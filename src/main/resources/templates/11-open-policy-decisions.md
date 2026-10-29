# Open Policy Decisions

## Purpose

This document tracks EasyBuy policy decisions that are not yet fully defined. It prevents Canzova from inventing rules that haven't been approved.

**Rule for the AI:** If a question relates to an item in this document, respond honestly:
> "That specific detail isn't covered in our current policy documentation. Let me escalate this to our team for a definitive answer."

Do not guess. Do not present a "likely" rule as a confirmed one.

---

## 1. Shipping and Delivery

| Decision | Current Status | AI Behavior |
|---|---|---|
| Calendar days vs. business days for 3–7 day estimate | Not defined — assume calendar days unless listing says otherwise | Qualify: "approximately 3–7 days" |
| How delivery estimate is calculated (by zone/category) | Not defined | Use general 3–7 day range |
| Failed delivery attempt limits and re-attempt rules | Not defined | Guide to tracking page; escalate if unresolved |
| Redelivery fees | Not defined | Do not mention fees |
| Compensation for late deliveries | Not defined | Never promise compensation |
| Delivery instructions changes (phone, notes) | Not defined | Advise customer to contact carrier directly |

---

## 2. Returns and Replacements

| Decision | Current Status | AI Behavior |
|---|---|---|
| When 7-day window starts (delivery date vs. next day) | Not defined — use delivery date as day 0 | Treat delivery date as start of window |
| Calendar vs. business days for return window | Not defined — assume calendar days | Say "7 days from delivery" |
| Exact non-returnable product list | Partial (innerwear, perishables, opened beauty) | Use category table in doc 02; escalate edge cases |
| Condition requirements (tags, seals, original packaging) | Not defined per category | Advise original packaging; escalate specific disputes |
| Who pays return shipping | Not defined | Do not make claims; escalate to agent |
| Pickup attempt limits and rescheduling fees | Not defined | Advise using app reschedule feature |
| Replacement vs. refund decision authority | Not defined | Ask customer preference; subject to availability |
| Exception approval authority for late returns | Not defined | Escalate all late-return exception requests |

---

## 3. Payments and Refunds

| Decision | Current Status | AI Behavior |
|---|---|---|
| Exact event that starts refund timer | Not defined — use "after return approval" as guideline | Say "within 3–5 business days of return approval" |
| Refund timeline per payment method | Not defined | Use standard 3–5 days; note bank may add 1–3 days |
| Pending authorization expiry timeline | Not defined | Tell customer to check with bank; typically 3–7 days |
| COD availability rules (by area/order value) | Not defined | Say "availability shown at checkout" |
| COD fees | Not defined | Do not mention fees |
| Duplicate payment resolution timeline | Not defined | 2–3 business days standard; escalate if unresolved |
| Payment reconciliation SLA | Not defined | Escalate and set expectation of 2–3 business days |

---

## 4. Cancellation and Order Changes

| Decision | Current Status | AI Behavior |
|---|---|---|
| Exact order statuses that allow cancellation | Not fully defined — pre-dispatch is safe | Use "before dispatch" as the cutoff |
| Cancellation fees | Not defined — assume none | Do not mention fees |
| Per-item cancellation from bundled orders | Not defined | Advise customer to try app; escalate if needed |
| Size/color/product changes after order | Not supported — cancel and reorder | Recommend cancel + reorder |
| Refund timing after post-dispatch cancellation | Not defined | After RTO, 3–5 business days |
| Exception approval for post-dispatch cancellation | Not defined | Escalate all such requests |

---

## 5. Warranty and Product Authenticity

| Decision | Current Status | AI Behavior |
|---|---|---|
| Which products carry EasyBuy-facilitated warranty | Not defined | Check product listing; escalate if unclear |
| Warranty duration by product category | Not defined — varies by brand | Direct to product listing and warranty card |
| Warranty exclusion list | Not defined — standard exclusions (physical damage, wear) | Explain standard exclusions as guidance |
| Counterfeit investigation timeline | Not defined | Promise escalation to Trust & Safety; no timeline |
| Manufacturer vs. seller warranty responsibility | Not defined per product | Check listing; escalate disputes |
| Service center list | Not defined | Direct to manufacturer website; escalate for EasyBuy-managed claims |

---

## 6. Coupons and Promotions

| Decision | Current Status | AI Behavior |
|---|---|---|
| Coupon stacking rules | Not allowed by default | Say "one coupon per order unless terms say otherwise" |
| Per-customer usage limits | Coupon-specific — check terms | Say "check coupon terms for usage limits" |
| Expired coupon extension policy | Not defined | Don't promise extension; escalate to supervisor |
| Retroactive discount application | Not supported | Don't promise; escalate for technical error cases |
| Post-checkout discount removal responsibility | Not defined | Investigate and escalate if terms were met |
| Promotional exception authority | Supervisor only | Escalate all exception requests |

---

## 7. Support Operations

| Decision | Current Status | AI Behavior |
|---|---|---|
| Official support hours | Not defined | Do not state specific hours |
| Response time SLAs | Not defined | Use "within 24–48 hours" as general guidance |
| Which actions AI can take autonomously | Create/update tickets; policy answers | Always escalate refunds, returns, security actions |
| Compensation and goodwill gesture authority | Supervisor only | Never promise without authorization |
| Which actions require human approval | Refunds, exceptions, cancellations, security | Always escalate these |

---

## 8. Security and Privacy

| Decision | Current Status | AI Behavior |
|---|---|---|
| Authentication method requirements | Registered email or phone | Use these as primary identifiers |
| Conversation retention period | Not defined | Do not make claims about data retention |
| Data deletion request handling | Not defined | Escalate to privacy/data team |
| What data can be sent to external AI providers | Not defined | Do not volunteer to send sensitive data |
| Redaction and logging requirements | Not defined | Follow minimum data principle |

---

## 9. How to Handle Undefined Policies

When a customer asks about something in this document:

1. **Acknowledge** the question genuinely
2. **Be honest**: "Our documentation doesn't have a specific answer for this scenario."
3. **Offer** to escalate: "Let me raise this with our team who can give you a confirmed answer."
4. **Never** make up a rule, even a "reasonable-sounding" one.

---

## 10. Updating This Knowledge Base

When a policy decision is made:
1. Update the relevant policy document (01–10).
2. Remove the item from this list (or mark it as Resolved).
3. Re-ingest the updated document in the vector store.
4. Run test queries to confirm the new answer is being retrieved.
5. Supersede any conflicting older content.

**Do not treat draft or mock policies as production-approved** simply because they exist in the knowledge base.
