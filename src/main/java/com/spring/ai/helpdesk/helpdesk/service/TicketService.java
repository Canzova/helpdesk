package com.spring.ai.helpdesk.helpdesk.service;

import com.spring.ai.helpdesk.helpdesk.Dto.TicketInputRequest;
import com.spring.ai.helpdesk.helpdesk.Dto.TicketResponse;
import com.spring.ai.helpdesk.helpdesk.Dto.TicketUpdateRequest;

public interface TicketService {
    TicketResponse createTicket(TicketInputRequest ticket);

    TicketResponse getTicketById(Long id);

    TicketResponse getTicketByEmail(String email);

    TicketResponse updateTicket(Long id, TicketUpdateRequest updateRequest);
}
