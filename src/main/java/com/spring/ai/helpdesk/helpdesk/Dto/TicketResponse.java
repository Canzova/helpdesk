package com.spring.ai.helpdesk.helpdesk.Dto;

import com.spring.ai.helpdesk.helpdesk.entity.Priority;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Getter
@Service
@AllArgsConstructor
@NoArgsConstructor
public class TicketResponse {

    private int ticketId;

    private String email;

    private String issueSummary;

    private Priority priority;

    private String userContactNumber;

    private Instant createdAt;
    private Instant updatedAt;

}
