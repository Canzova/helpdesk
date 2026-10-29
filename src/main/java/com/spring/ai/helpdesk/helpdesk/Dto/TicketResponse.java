package com.spring.ai.helpdesk.helpdesk.Dto;

import com.spring.ai.helpdesk.helpdesk.entity.Priority;
import com.spring.ai.helpdesk.helpdesk.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TicketResponse {

    private int ticketId;

    private String email;

    private String issueSummary;

    private Priority priority;

    private Status status;

    private String category;

    private String userContactNumber;

    private Instant createdAt;
    private Instant updatedAt;
}
