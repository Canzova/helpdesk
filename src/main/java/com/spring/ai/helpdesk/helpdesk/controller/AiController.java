package com.spring.ai.helpdesk.helpdesk.controller;

import com.spring.ai.helpdesk.helpdesk.service.AiService;
import com.spring.ai.helpdesk.helpdesk.service.AudioResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;
    private final AudioResponseService audioResponseService;

    @GetMapping(value = "/chat")
    public ResponseEntity<?> chat(
            @RequestParam(name = "conversationId") String conversationId,
            @RequestParam(name = "query", defaultValue = "Hi", required = false) String query,
            @RequestParam(name = "outputType", defaultValue = "text", required = false) String outputType) {
        return aiService.chat(conversationId, outputType, query);
    }

    @PostMapping(value = "/audio-input")
    public ResponseEntity<?> audioInput(
            @RequestParam(name = "conversationId") String conversationId,
            @RequestParam(name = "audioFile") MultipartFile file,
            @RequestParam(name = "outputType", defaultValue = "text", required = false) String outputType) {
        return aiService.chatWithAudio(conversationId, outputType, file.getResource());
    }

    @PostMapping(value = "/audio-response",produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public byte[] getAudioResponse(@RequestBody String str){

        byte[] response = audioResponseService.generateAudio(str);
        System.out.println("response: " + Arrays.toString(response));
        System.out.println("response.length: " + response.length);
        return response;
    }

}
