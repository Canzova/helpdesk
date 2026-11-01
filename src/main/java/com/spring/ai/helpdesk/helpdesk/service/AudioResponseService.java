package com.spring.ai.helpdesk.helpdesk.service;

import reactor.core.publisher.Flux;

public interface AudioResponseService {

    byte[] generateAudio(String text);

}
