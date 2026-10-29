package com.spring.ai.helpdesk.helpdesk.Dto;

import com.spring.ai.helpdesk.helpdesk.entity.Priority;
import com.spring.ai.helpdesk.helpdesk.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TicketUpdateRequest {

    private String issueSummary;

    private Priority priority;

    private Status status;

    private String category;

    private String userContactNumber;
}
