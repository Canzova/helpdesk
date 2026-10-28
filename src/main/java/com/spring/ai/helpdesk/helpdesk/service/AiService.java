package com.spring.ai.helpdesk.helpdesk.service;

import reactor.core.publisher.Flux;

public interface AiService {
    Flux<String> chat(String conversationId, String query);
}
