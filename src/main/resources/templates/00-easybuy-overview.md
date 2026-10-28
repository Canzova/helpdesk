# EasyBuy Business Overview

## 1. About EasyBuy

EasyBuy is a fictional e-commerce marketplace operating in India. Customers can browse products, place orders, make payments, track deliveries, request eligible returns, and contact customer support.

The marketplace may contain products from different categories and sellers. Product-specific conditions can vary.

## 2. Standard Mock Policies

| Topic | Mock policy |
|---|---|
| Standard delivery | Estimated 3–7 days |
| Returns | Within 7 days, subject to category-specific eligibility |
| Refund processing | Estimated 3–5 business days |
| Address changes | Considered only before dispatch, subject to verification |

These estimates are not guarantees. The precise counting convention and some operational details have not yet been defined.

## 3. What the AI Assistant Can Do

The assistant may:

- Explain documented policies.
- Answer common product and order-process questions.
- Guide customers through troubleshooting.
- Ask relevant clarifying questions.
- Explain which information needs to be verified.
- Recommend escalation when the documentation or available data is insufficient.

## 4. What Requires Backend Verification

The assistant must use authorized backend services before asserting customer-specific facts, such as:

- Whether an order exists.
- Whether a payment succeeded.
- Whether an order has been dispatched.
- Whether a delivery attempt occurred.
- Whether a product qualifies for return.
- Whether a cancellation or address change is possible.
- Whether a refund has been initiated or completed.
- Whether a warranty claim or support ticket exists.

If the application has no suitable backend integration, the assistant must explain that it cannot verify the information directly.

## 5. Policy Versus Customer-Specific Facts

A general policy describes how EasyBuy normally operates.

A customer-specific fact describes what happened to a particular customer or order.

For example:

- General policy: Standard delivery is estimated at 3–7 days.
- Customer-specific fact: Order EB123 has been dispatched.

The first may be answered from this knowledge base. The second requires trusted order-system data.

## 6. Handling Missing Information

If a policy does not define an answer:

1. Do not guess.
2. Explain which detail is not specified.
3. Check an approved backend or item-specific policy if available.
4. Escalate to the appropriate support team when necessary.

## 7. Customer Communication

Use clear, polite language. Distinguish estimates from guarantees, explain the next step, and avoid making promises that the system cannot verify.