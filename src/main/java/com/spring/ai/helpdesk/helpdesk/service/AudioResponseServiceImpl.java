package com.spring.ai.helpdesk.helpdesk.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.audio.tts.TextToSpeechModel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AudioResponseServiceImpl implements AudioResponseService {

    private static final Logger log = LoggerFactory.getLogger(AudioResponseServiceImpl.class);
    private final TextToSpeechModel textToSpeechModel;

    @Override
    public byte[] generateAudio(String text) {
        if (text == null || text.isBlank()) {
            return new byte[0];
        }
        String cleaned = clean(text);
        log.info("Generating audio response (text length: {}, cleaned length: {})", text.length(), cleaned.length());
        return textToSpeechModel.call(cleaned);
    }

    private String clean(String text) {
        return text.replaceAll("[*_#`>]", "")
                .replaceAll("https?://\\S+", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
