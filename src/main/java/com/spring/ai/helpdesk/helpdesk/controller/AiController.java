package com.spring.ai.helpdesk.helpdesk.controller;

import com.spring.ai.helpdesk.helpdesk.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;

    @GetMapping("/chat")
    public Flux<String> chat(@RequestParam(name = "query", defaultValue = "Hi", required = false) String query) {
        return aiService.chat(query);
    }

}
