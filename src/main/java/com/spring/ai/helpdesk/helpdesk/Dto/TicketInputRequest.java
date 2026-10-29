package com.spring.ai.helpdesk.helpdesk.Dto;

import com.spring.ai.helpdesk.helpdesk.entity.Priority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class TicketInputRequest {

    @NotBlank
    @Email
    private String email;

    private String issueSummary;

    private Priority priority;

    private String category;

    private String userContactNumber;
}
