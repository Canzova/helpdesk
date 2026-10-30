package com.spring.ai.helpdesk.helpdesk.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.Message;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Classifies user messages into ACTION or KNOWLEDGE intents using a lightweight
 * LLM call, enabling smart routing in the AI pipeline:
 *
 * <ul>
 *   <li>ACTION  → direct ChatClient path (tools + memory, no RAG overhead)</li>
 *   <li>KNOWLEDGE → full RAG pipeline (retrieval + augmentation + tools + memory)</li>
 * </ul>
 */
@Service
public class IntentClassifierService {

    private static final Logger log = LoggerFactory.getLogger(IntentClassifierService.class);

    private final ChatClient ragChatClient;
    private final ChatMemory chatMemory;

    @Value("classpath:/templates/intent-classifier.st")
    private Resource intentClassifierPrompt;

    public IntentClassifierService(@Qualifier("ragChatClient") ChatClient ragChatClient,
                                   ChatMemory chatMemory) {
        this.ragChatClient = ragChatClient;
        this.chatMemory = chatMemory;
    }

    /**
     * Classifies the current user query given the recent conversation history.
     *
     * @param conversationId the chat session ID (used to pull recent history)
     * @param query          the current user message
     * @return {@link IntentClassifier#ACTION} or {@link IntentClassifier#KNOWLEDGE}
     */
    public IntentClassifier classify(String conversationId, String query) {
        String history = buildHistorySnippet(conversationId);

        String raw = ragChatClient
                .prompt()
                .user(u -> u
                        .text(intentClassifierPrompt)
                        .param("history", history)
                        .param("query", query)
                )
                .call()
                .content();

        String result = raw == null ? "" : raw.strip().toUpperCase();

        IntentClassifier intent = result.startsWith("ACTION")
                ? IntentClassifier.ACTION
                : IntentClassifier.KNOWLEDGE;

        log.debug("Intent classified as {} for query: {}", intent, query);
        return intent;
    }

    /**
     * Builds a compact history snippet (last 6 messages) to give the classifier
     * enough context without ballooning the prompt.
     */
    private String buildHistorySnippet(String conversationId) {
        try {
            List<Message> all = chatMemory.get(conversationId);
            if (all == null || all.isEmpty()) {
                return "(no prior conversation)";
            }
            // Keep only the last 6 messages to stay within a small prompt budget
            List<Message> messages = all.size() > 10 ? all.subList(all.size() - 10, all.size()) : all;
            return messages.stream()
                    .map(m -> m.getMessageType().name() + ": " + m.getText())
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            log.warn("Could not retrieve chat history for intent classification: {}", e.getMessage());
            return "(history unavailable)";
        }
    }
}
