package com.spring.ai.helpdesk.helpdesk;

import com.spring.ai.helpdesk.helpdesk.controller.AiController;
import com.spring.ai.helpdesk.helpdesk.service.AiService;
import com.spring.ai.helpdesk.helpdesk.service.AudioResponseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import reactor.core.publisher.Flux;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AiControllerTest {

    private AiService aiService;
    private AudioResponseService audioResponseService;
    private AiController aiController;

    @BeforeEach
    void setUp() {
        aiService = mock(AiService.class);
        audioResponseService = mock(AudioResponseService.class);
        aiController = new AiController(aiService, audioResponseService);
    }

    @Test
    void testChatTextResponse() {
        Flux<String> stream = Flux.just("Hello", " world");
        doReturn(ResponseEntity.ok().contentType(MediaType.TEXT_EVENT_STREAM).body(stream))
                .when(aiService).chat("conv1", "text", "hi");

        ResponseEntity<?> response = aiController.chat("conv1", "hi", "text");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(MediaType.TEXT_EVENT_STREAM, response.getHeaders().getContentType());
        assertEquals(stream, response.getBody());
    }

    @Test
    void testChatAudioResponse() {
        byte[] audioBytes = new byte[]{10, 20, 30};
        doReturn(ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .header("X-Response-Text", "Hello%20world")
                .body(audioBytes))
                .when(aiService).chat("conv1", "audio", "hi");

        ResponseEntity<?> response = aiController.chat("conv1", "hi", "audio");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(MediaType.parseMediaType("audio/mpeg"), response.getHeaders().getContentType());
        assertEquals("Hello%20world", response.getHeaders().getFirst("X-Response-Text"));
        assertArrayEquals(audioBytes, (byte[]) response.getBody());
    }

    @Test
    void testAudioInputVoiceToVoice() {
        byte[] audioBytes = new byte[]{1, 2, 3, 4};
        MockMultipartFile file = new MockMultipartFile("audioFile", "test.webm", "audio/webm", new byte[]{5, 6});

        doReturn(ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .header("X-Transcript", "transcribed%20speech")
                .header("X-Response-Text", "bot%20reply")
                .body(audioBytes))
                .when(aiService).chatWithAudio(eq("conv1"), eq("audio"), any(Resource.class));

        ResponseEntity<?> response = aiController.audioInput("conv1", file, "audio");
        assertEquals(200, response.getStatusCode().value());
        assertEquals(MediaType.parseMediaType("audio/mpeg"), response.getHeaders().getContentType());
        assertEquals("transcribed%20speech", response.getHeaders().getFirst("X-Transcript"));
        assertEquals("bot%20reply", response.getHeaders().getFirst("X-Response-Text"));
        assertArrayEquals(audioBytes, (byte[]) response.getBody());
    }

    @Test
    void testGetAudioResponseDirect() {
        byte[] audio = new byte[]{9, 8, 7};
        when(audioResponseService.generateAudio("test text")).thenReturn(audio);

        byte[] result = aiController.getAudioResponse("test text");
        assertArrayEquals(audio, result);
    }
}
