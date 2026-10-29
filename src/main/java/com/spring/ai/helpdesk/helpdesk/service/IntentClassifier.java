package com.spring.ai.helpdesk.helpdesk.service;

/**
 * Classifies a user message into one of two routing intents:
 *
 * ACTION  — the message is a transactional / tool intent that does not need
 *            knowledge-base retrieval (ticket CRUD, confirmations, date/time
 *            queries, greetings, small-talk, simple yes/no replies).
 *
 * KNOWLEDGE — the message is an information-seeking intent that benefits from
 *              RAG retrieval against the EasyBuy knowledge base (policy
 *              questions, how-to, delivery / refund / return / coupon queries).
 */
public enum IntentClassifier {
    ACTION,
    KNOWLEDGE
}
