package com.spring.ai.helpdesk.helpdesk.service;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;

public interface AiService {
    ResponseEntity<?> chat(String conversationId, String outputType, String query);

    ResponseEntity<?> chatWithAudio(String conversationId, String outputType, Resource resource);
}
