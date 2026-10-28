package com.spring.ai.helpdesk.helpdesk.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.markdown.MarkdownDocumentReader;
import org.springframework.ai.reader.markdown.config.MarkdownDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.List;


// Run this wit test to load the data
@Component
@RequiredArgsConstructor
public class ETLPipeLineImpl  implements ETLPipeLine {

    private final VectorStore vectorStore;

    @Value("classpath:/templates/*.md")
    private Resource[] markdownResources;

    @Override
    public void ingest() {
        // Step 1 : E : Extract
        MarkdownDocumentReaderConfig config = MarkdownDocumentReaderConfig.builder()
                .withHorizontalRuleCreateDocument(true) // Horizontal rule will create a separate doc
                .withIncludeCodeBlock(false)  // This will create diff doc for code bocks
                .withIncludeBlockquote(false)
                .withAdditionalMetadata("filename", "RAG-Input")
                .build();

        MarkdownDocumentReader reader = new MarkdownDocumentReader(List.of(this.markdownResources), config);

        List<Document> documents = reader.read();

        // Step 2 : T : Transform
        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(800)           // max tokens per chunk
                .withMinChunkSizeChars(400)   // discard chunks shorter than 400 chars
                .withMinChunkLengthToEmbed(10) // skip chunks with fewer than 10 tokens
                .withMaxNumChunks(5000)        // cap total chunks produced per document
                .withKeepSeparator(true)       // retain the separator token at chunk boundaries
                .build();
        documents = splitter.apply(documents);

        // Step 3 : L : Load
        vectorStore.add(documents);
    }
}
