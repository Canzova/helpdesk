package com.spring.ai.helpdesk.helpdesk.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final ChatClient chatClient;

    @Override
    public Flux<String> chat(String query) {
       return chatClient.prompt().user(query).stream().content();
    }
}
