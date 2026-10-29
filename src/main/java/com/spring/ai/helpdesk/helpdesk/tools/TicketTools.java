package com.spring.ai.helpdesk.helpdesk.tools;

import com.spring.ai.helpdesk.helpdesk.Dto.TicketInputRequest;
import com.spring.ai.helpdesk.helpdesk.Dto.TicketResponse;
import com.spring.ai.helpdesk.helpdesk.Dto.TicketUpdateRequest;
import com.spring.ai.helpdesk.helpdesk.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TicketTools {

    private final TicketService ticketService;

    @Tool(description = "Use this tool to create a new support ticket in the database when the user wants to raise a ticket. Requires ALL of these fields: email, issueSummary, priority (LOW/MEDIUM/HIGH), category (Billing/Technical/Account/Shipping/Returns/Network/Hardware/Software/Other), and userContactNumber. Do NOT call this tool if any field is missing.")
    public TicketResponse createTicket(@ToolParam(description = "The ticket information collected from the user. Must include: email, issueSummary, priority, category, and userContactNumber.") TicketInputRequest ticket) {
        return ticketService.createTicket(ticket);
    }

    @Tool(description = "Use this tool to fetch an existing ticket from the database when the user provides a ticket ID.")
    public TicketResponse getTicketById(@ToolParam(description = "The ticket ID to look up.") Long id) {
        return ticketService.getTicketById(id);
    }

    @Tool(description = "Use this tool to fetch an existing ticket from the database when the user provides their email address.")
    public TicketResponse getTicketByEmail(@ToolParam(description = "The registered email address of the user.") String email) {
        return ticketService.getTicketByEmail(email);
    }

    @Tool(description = "Use this tool to update an existing support ticket. Call this when the user wants to change the priority, status, issue summary, category, or contact number of an existing ticket. Requires the ticket ID and the fields to update.")
    public TicketResponse updateTicket(
            @ToolParam(description = "The ID of the ticket to update.") Long id,
            @ToolParam(description = "The fields to update. Only include fields that should be changed: issueSummary, priority (LOW/MEDIUM/HIGH), status (OPEN/PENDING/CLOSED), category, or userContactNumber.") TicketUpdateRequest updateRequest) {
        return ticketService.updateTicket(id, updateRequest);
    }
}
