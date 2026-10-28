package com.spring.ai.helpdesk.helpdesk.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.generation.augmentation.ContextualQueryAugmenter;
import org.springframework.ai.rag.preretrieval.query.expansion.MultiQueryExpander;
import org.springframework.ai.rag.preretrieval.query.transformation.CompressionQueryTransformer;
import org.springframework.ai.rag.preretrieval.query.transformation.RewriteQueryTransformer;
import org.springframework.ai.rag.preretrieval.query.transformation.TranslationQueryTransformer;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;


@Service
public class AiServiceImpl implements AiService {

    private final ChatClient chatClient;
    private final ChatClient ragChatClient;
    private final VectorStore vectorStore;

    @Value("classpath:/templates/multiQueryExpander.st")
    private Resource multiQueryExpanderPrompt;

    @Value("classpath:/templates/canzova-system-prompt.st")
    private Resource systemPrompt;

    public AiServiceImpl(ChatClient chatClient,
                         @Qualifier("ragChatClient") ChatClient ragChatClient,
                         VectorStore vectorStore) {
        this.chatClient = chatClient;
        this.ragChatClient = ragChatClient;
        this.vectorStore = vectorStore;
    }

    @Override
    public Flux<String> chat(String conversationId, String query) {

        RetrievalAugmentationAdvisor ragAdvisor = RetrievalAugmentationAdvisor.builder()
                // Pre-retrieval
                .queryTransformers(
                        // Compresses conversation history + follow-up into a standalone query
                        CompressionQueryTransformer.builder()
                                .chatClientBuilder(ragChatClient.mutate())
                                .build(),

                        // Rewrites the query for better vector store retrieval results
                        RewriteQueryTransformer.builder()
                                .chatClientBuilder(ragChatClient.mutate())
                                .build(),

                        // Translates query to the language used by the embedding model
                        TranslationQueryTransformer.builder()
                                .chatClientBuilder(ragChatClient.mutate())
                                .targetLanguage("english")
                                .build()
                )
                // Expands query into multiple variants for broader retrieval coverage
                .queryExpander(
                        MultiQueryExpander.builder()

                                .chatClientBuilder(ragChatClient.mutate())
                                .numberOfQueries(3)
                                .promptTemplate(new PromptTemplate(multiQueryExpanderPrompt))
                                .build()
                )
                // Retrieval
                .documentRetriever(
                        VectorStoreDocumentRetriever.builder()
                                .vectorStore(vectorStore)
                                .similarityThreshold(0.73)
                                .topK(4)
                                .build()
                )
                // Generation: augments the query with retrieved context
                .queryAugmenter(
                        ContextualQueryAugmenter.builder()
                                .build()
                )
                .build();

        return chatClient
                .prompt()
                .advisors(a -> a
                        .advisors(ragAdvisor)
                        .param(ChatMemory.CONVERSATION_ID, conversationId)
                )
                .system(systemPrompt)
                .user(query)
                .stream()
                .content();
    }
}
