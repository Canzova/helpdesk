package com.spring.ai.helpdesk.helpdesk.service;

import com.spring.ai.helpdesk.helpdesk.tools.DateAndTimeTool;
import com.spring.ai.helpdesk.helpdesk.tools.TicketTools;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.generation.augmentation.ContextualQueryAugmenter;
import org.springframework.ai.rag.preretrieval.query.expansion.MultiQueryExpander;
import org.springframework.ai.rag.preretrieval.query.transformation.CompressionQueryTransformer;
import org.springframework.ai.rag.preretrieval.query.transformation.RewriteQueryTransformer;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class AiServiceImpl implements AiService {

    private static final Logger log = LoggerFactory.getLogger(AiServiceImpl.class);

    private final ChatClient chatClient;
    private final ChatClient ragChatClient;
    private final VectorStore vectorStore;
    private final DateAndTimeTool dateAndTimeTool;
    private final TicketTools ticketTools;
    private final IntentClassifierService intentClassifierService;

    @Value("classpath:/templates/multiQueryExpander.st")
    private Resource multiQueryExpanderPrompt;

    @Value("classpath:/templates/canzova-system-prompt.st")
    private Resource systemPrompt;

    // Built once at startup — RAG advisor is stateless and safe to reuse across requests.
    // This eliminates the per-request object construction overhead.
    private RetrievalAugmentationAdvisor ragAdvisor;

    public AiServiceImpl(ChatClient chatClient,
                         @Qualifier("ragChatClient") ChatClient ragChatClient,
                         VectorStore vectorStore,
                         DateAndTimeTool dateAndTimeTool,
                         TicketTools ticketTools,
                         IntentClassifierService intentClassifierService) {
        this.chatClient = chatClient;
        this.ragChatClient = ragChatClient;
        this.vectorStore = vectorStore;
        this.dateAndTimeTool = dateAndTimeTool;
        this.ticketTools = ticketTools;
        this.intentClassifierService = intentClassifierService;
    }

    @PostConstruct
    private void buildRagAdvisor() {
        // Removed TranslationQueryTransformer — it's a no-op for English input (which covers
        // 99% of queries) and adds a full LLM round-trip for zero benefit in this deployment.
        //
        // Pipeline is now: Compress → Rewrite → MultiExpand(3) → Retrieve → Augment
        // That's 2 pre-retrieval LLM calls instead of 3 (saving ~300–400ms per KNOWLEDGE request).
        ragAdvisor = RetrievalAugmentationAdvisor.builder()
                .queryTransformers(
                        // Synthesises conversation history + follow-up into a standalone query
                        CompressionQueryTransformer.builder()
                                .chatClientBuilder(ragChatClient.mutate())
                                .build(),
                        // Rewrites the standalone query for better vector-store retrieval
                        RewriteQueryTransformer.builder()
                                .chatClientBuilder(ragChatClient.mutate())
                                .build()
                )
                .queryExpander(
                        MultiQueryExpander.builder()
                                .chatClientBuilder(ragChatClient.mutate())
                                .numberOfQueries(3)
                                .promptTemplate(new PromptTemplate(multiQueryExpanderPrompt))
                                .build()
                )
                .documentRetriever(
                        VectorStoreDocumentRetriever.builder()
                                .vectorStore(vectorStore)
                                .similarityThreshold(0.73)
                                .topK(4)
                                .build()
                )
                // allowEmptyContext(true): when RAG finds no relevant documents the model
                // still responds using memory and tools rather than refusing.
                .queryAugmenter(
                        ContextualQueryAugmenter.builder()
                                .allowEmptyContext(true)
                                .build()
                )
                .build();
        log.info("RAG advisor initialised and cached.");
    }

    @Override
    public Flux<String> chat(String conversationId, String query) {

        // ── Intent classification ──────────────────────────────────────────────
        IntentClassifier intent = intentClassifierService.classify(conversationId, query);
        log.info("Routing [{}] → {} path",
                query.length() > 60 ? query.substring(0, 60) + "..." : query, intent);

        return switch (intent) {

            // ── ACTION path ───────────────────────────────────────────────────
            // No RAG. Tools + memory only. Fast path for ticket CRUD,
            // confirmations, greetings, date/time, data-collection follow-ups.
            case ACTION -> chatClient
                    .prompt()
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                    .system(systemPrompt)
                    .user(query)
                    .tools(dateAndTimeTool, ticketTools)
                    .stream()
                    .content();

            // ── KNOWLEDGE path ────────────────────────────────────────────────
            // Full RAG pipeline for policy / how-to / product questions.
            // Uses the shared, pre-built ragAdvisor instance.
            case KNOWLEDGE -> chatClient
                    .prompt()
                    .advisors(a -> a
                            .advisors(ragAdvisor)
                            .param(ChatMemory.CONVERSATION_ID, conversationId)
                    )
                    .system(systemPrompt)
                    .user(query)
                    .tools(dateAndTimeTool, ticketTools)
                    .stream()
                    .content();
        };
    }
}
