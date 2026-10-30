package com.spring.ai.helpdesk.helpdesk.controller;

import com.spring.ai.helpdesk.helpdesk.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    @GetMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(
            @RequestParam(name = "conversationId") String conversationId,
            @RequestParam(name = "query", defaultValue = "Hi", required = false) String query) {
        return aiService.chat(conversationId, query);
    }

    @PostMapping(value = "/audio-input", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> audioInput(@RequestParam(name = "conversationId") String conversationId,
                                   @RequestParam(name = "audioFile") MultipartFile file) {
        return aiService.chatWithAudio(conversationId, file.getResource());
    }

}
