package com.spring.ai.helpdesk.helpdesk;

import com.spring.ai.helpdesk.helpdesk.service.AudioResponseServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.ai.audio.tts.TextToSpeechModel;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.mockito.Mockito.*;

class AudioResponseServiceTest {

    @Test
    void shouldGenerateAudioAndCleanMarkdown() {
        TextToSpeechModel model = mock(TextToSpeechModel.class);
        byte[] expectedAudio = new byte[]{1, 2, 3};
        when(model.call("Hello this is clean text")).thenReturn(expectedAudio);

        AudioResponseServiceImpl service = new AudioResponseServiceImpl(model);
        byte[] result = service.generateAudio("**Hello** # `this` > is *clean* text https://example.com");

        assertArrayEquals(expectedAudio, result);
        verify(model).call("Hello this is clean text");
    }

    @Test
    void shouldReturnEmptyArrayWhenTextIsBlankOrNull() {
        TextToSpeechModel model = mock(TextToSpeechModel.class);
        AudioResponseServiceImpl service = new AudioResponseServiceImpl(model);

        byte[] resultNull = service.generateAudio(null);
        byte[] resultBlank = service.generateAudio("   ");

        assertArrayEquals(new byte[0], resultNull);
        assertArrayEquals(new byte[0], resultBlank);
        verifyNoInteractions(model);
    }
}
