package com.spring.ai.helpdesk.helpdesk.Dto;

import com.spring.ai.helpdesk.helpdesk.entity.Priority;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

@Getter
@Service
@AllArgsConstructor
@NoArgsConstructor
public class TicketInputRequest {

    @NotBlank
    @Email
    private String email;

    private String issueSummary;

    private Priority priority;

    private String userContactNumber;
}
