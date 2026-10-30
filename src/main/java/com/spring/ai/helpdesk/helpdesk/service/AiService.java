package com.spring.ai.helpdesk.helpdesk.service;

import org.springframework.core.io.Resource;
import reactor.core.publisher.Flux;

public interface AiService {
    Flux<String> chat(String conversationId, String query);

    Flux<String> chatWithAudio(String conversationId, Resource resource);
}
